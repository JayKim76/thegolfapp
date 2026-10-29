import { API_BASE, AuthService } from './AuthService';
import { MemberService } from './MemberService';

export interface OCRResult {
    date: string;
    courseName?: string;
    players: OCRPlayer[];
}

export interface OCRPlayer {
    originalName: string; // Name recognized from the scorecard image
    matchedMemberId?: number; // Linked system member (admin can reassign)
    totalScore: number; // Total score only
}

// Real scorecard recognition: the photo goes to the backend
// (POST /api/ocr/scorecard), which calls Gemini vision server-side.
// The Gemini key never exists in the app. Recognition is a draft — the
// admin verifies and fixes names/scores on the confirm screen before
// anything is saved, so no accuracy is promised here.
export const OCRService = {
    scanScorecard: async (imageUri: string, imageBase64?: string, mimeType?: string): Promise<OCRResult> => {
        let base64 = imageBase64;
        if (!base64) {
            // Fallback when the picker did not return base64: read via fetch.
            const blob: Blob = await (await fetch(imageUri)).blob();
            base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
                reader.onloadend = () => {
                    const result = String(reader.result || '');
                    resolve(result.includes(',') ? result.split(',')[1] : result);
                };
                reader.readAsDataURL(blob);
            });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 70000);
        let response: Response;
        try {
            response = await fetch(`${API_BASE}/api/ocr/scorecard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...AuthService.authHeaders(),
                },
                body: JSON.stringify({ imageBase64: base64, mimeType: mimeType || 'image/jpeg' }),
                signal: controller.signal,
            });
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                throw new Error('인식이 너무 오래 걸립니다. 네트워크를 확인하고 다시 시도하세요.');
            }
            throw new Error('인식 서버에 연결하지 못했습니다.');
        } finally {
            clearTimeout(timeoutId);
        }

        const data: any = await response.json().catch(() => null);
        if (!response.ok) {
            // Surface the server's message (e.g. GEMINI_API_KEY not configured)
            throw new Error(data?.message || '스코어카드 인식에 실패했습니다.');
        }

        // Match recognized names to club members so the admin starts from
        // linked records; unmatched names stay editable on the confirm screen.
        const members = await MemberService.getMembers();
        const players: OCRPlayer[] = (data.players || []).map((p: any) => {
            const match = members.find(m => m.name === p.name || m.name.includes(p.name) || p.name.includes(m.name));
            return {
                originalName: p.name,
                matchedMemberId: match ? match.id : undefined,
                totalScore: p.totalScore,
            };
        });

        return {
            date: data.date || new Date().toISOString().split('T')[0],
            courseName: data.courseName || undefined,
            players,
        };
    },
};
