import { Router, Request, Response } from 'express';

const router = Router();

// ---------------------------------------------------------------------------
// Scorecard OCR — real recognition via Gemini vision, server-side only.
// The API key lives in backend/.env (GEMINI_API_KEY) and never ships to the
// app. The client sends the photo as base64; the response is the extracted
// date / course / per-player TOTAL scores, which the admin then verifies
// and corrects on the confirm screen before anything is saved.
// GEMINI_API_BASE can point at a compatible stub for tests.
// ---------------------------------------------------------------------------

const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com';
const GEMINI_OCR_MODEL = process.env.GEMINI_OCR_MODEL || 'gemini-2.5-flash';
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_BASE64_CHARS = 11_000_000; // ~8MB binary

const PROMPT = `이 사진은 골프 스코어카드입니다. 아래 규칙으로 정보를 추출하세요.
- date: 라운드 날짜를 YYYY-MM-DD 형식으로. 카드에서 읽을 수 없으면 빈 문자열("").
- courseName: 골프장 이름. 읽을 수 없으면 빈 문자열("").
- players: 선수별로 이름(name)과 총타수(totalScore)만 추출하세요.
  - 총타수가 인쇄/기재돼 있으면 그 값을, 없고 홀별 스코어만 있으면 18홀(있는 홀 전부) 합계를 쓰세요.
  - 이름은 카드에 적힌 표기 그대로 쓰세요.
  - 이름을 읽을 수 없는 선수는 제외하세요. 추측으로 지어내지 마세요.`;

const RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        date: { type: 'STRING' },
        courseName: { type: 'STRING' },
        players: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    name: { type: 'STRING' },
                    totalScore: { type: 'INTEGER' },
                },
                required: ['name', 'totalScore'],
            },
        },
    },
    required: ['players'],
};

// POST /api/ocr/scorecard  { imageBase64, mimeType }
router.post('/scorecard', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(503).json({
            error: 'OCR_NOT_CONFIGURED',
            message: '서버에 GEMINI_API_KEY가 설정되지 않았습니다. backend/.env에 키를 넣고 서버를 재시작하세요.',
        });
        return;
    }

    const { imageBase64, mimeType } = req.body ?? {};
    if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
        res.status(400).json({ error: 'imageBase64 is required' });
        return;
    }
    if (imageBase64.length > MAX_BASE64_CHARS) {
        res.status(413).json({ error: 'Image is too large' });
        return;
    }
    const mime = typeof mimeType === 'string' && ALLOWED_MIME.includes(mimeType) ? mimeType : 'image/jpeg';
    const base64 = imageBase64.replace(/^data:[^,]+,/, '');

    try {
        const fetchFn = (globalThis as any).fetch as typeof fetch;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60_000);

        const upstream = await fetchFn(
            `${GEMINI_API_BASE}/v1beta/models/${GEMINI_OCR_MODEL}:generateContent`,
            {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: PROMPT },
                                { inlineData: { mimeType: mime, data: base64 } },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0,
                        responseMimeType: 'application/json',
                        responseSchema: RESPONSE_SCHEMA,
                    },
                }),
            }
        );
        clearTimeout(timeout);

        if (!upstream.ok) {
            const detail = await upstream.text().catch(() => '');
            console.error('Gemini OCR upstream error:', upstream.status, detail.slice(0, 300));
            res.status(502).json({ error: 'OCR_UPSTREAM_ERROR', message: '인식 서비스 호출에 실패했습니다. 잠시 후 다시 시도하세요.' });
            return;
        }

        const data: any = await upstream.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') ?? '';
        let parsed: any;
        try {
            parsed = JSON.parse(text);
        } catch {
            console.error('Gemini OCR returned non-JSON:', text.slice(0, 300));
            res.status(502).json({ error: 'OCR_PARSE_ERROR', message: '인식 결과를 해석하지 못했습니다. 사진을 다시 찍어보세요.' });
            return;
        }

        const seen = new Set<string>();
        const players = (Array.isArray(parsed.players) ? parsed.players : [])
            .filter((p: any) => typeof p?.name === 'string' && p.name.trim() && Number.isFinite(Number(p.totalScore)))
            .map((p: any) => ({ name: p.name.trim(), totalScore: Math.round(Number(p.totalScore)) }))
            .filter((p: any) => p.totalScore >= 30 && p.totalScore <= 250)
            .filter((p: any) => (seen.has(p.name) ? false : (seen.add(p.name), true)));

        if (players.length === 0) {
            res.status(422).json({ error: 'NO_PLAYERS_RECOGNIZED', message: '스코어카드에서 선수를 읽지 못했습니다. 카드 전체가 나오게 다시 찍어보세요.' });
            return;
        }

        res.json({
            date: typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null,
            courseName: typeof parsed.courseName === 'string' && parsed.courseName.trim() ? parsed.courseName.trim() : null,
            players,
        });
    } catch (error: any) {
        if (error?.name === 'AbortError') {
            res.status(504).json({ error: 'OCR_TIMEOUT', message: '인식이 너무 오래 걸립니다. 다시 시도하세요.' });
            return;
        }
        console.error('Error running scorecard OCR:', error);
        res.status(500).json({ error: 'Failed to run scorecard OCR' });
    }
});

export default router;
