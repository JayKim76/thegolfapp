import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// ---------------------------------------------------------------------------
// Rounds are stored in the database (RoundSession + one Round per player).
// The admin records a whole outing at once; each player's score becomes a
// Round row linked to that member, which is what statistics read back.
// Response shape is unchanged for the app:
//   { id, date, courseName, players: [{ memberId?, name, score }] }
// ---------------------------------------------------------------------------

interface RoundPlayerInput {
    memberId?: number;
    name?: string;
    score: number;
}

function toSessionShape(session: {
    id: number;
    date: string;
    courseName: string | null;
    scores: { memberId: number | null; guestName: string | null; score: number; member: { name: string } | null }[];
}) {
    return {
        id: session.id,
        date: session.date,
        courseName: session.courseName ?? '',
        players: session.scores.map(s => ({
            memberId: s.memberId ?? undefined,
            name: s.member?.name ?? s.guestName ?? '이름 없음',
            score: s.score,
        })),
    };
}

// GET /api/rounds — all recorded outings, newest first.
// Scores saved before sessions existed (sessionId = null) are grouped by
// date + course so nothing already recorded disappears from the list.
router.get('/', async (req: Request, res: Response) => {
    try {
        const sessions = await prisma.roundSession.findMany({
            include: { scores: { include: { member: { select: { name: true } } } } },
            orderBy: { date: 'desc' },
        });

        const orphans = await prisma.round.findMany({
            where: { sessionId: null },
            include: { member: { select: { name: true } } },
            orderBy: { date: 'desc' },
        });
        const orphanGroups = new Map<string, typeof orphans>();
        for (const r of orphans) {
            const key = `${r.date}|${r.courseName ?? ''}`;
            if (!orphanGroups.has(key)) orphanGroups.set(key, []);
            orphanGroups.get(key)!.push(r);
        }
        const orphanSessions = [...orphanGroups.values()].map(group => ({
            id: group[0].id, // stable enough for list keys; these rows predate sessions
            date: group[0].date,
            courseName: group[0].courseName ?? '',
            players: group.map(r => ({
                memberId: r.memberId ?? undefined,
                name: r.member?.name ?? r.guestName ?? '이름 없음',
                score: r.score,
            })),
        }));

        res.json([...sessions.map(toSessionShape), ...orphanSessions].sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
        console.error('Error fetching rounds:', error);
        res.status(500).json({ error: 'Failed to fetch rounds' });
    }
});

// POST /api/rounds — admin records one outing for several players at once.
// Each player is resolved to a member (by memberId, else by exact name);
// unresolved players are stored as guests with their name kept.
router.post('/', async (req: Request, res: Response) => {
    try {
        const { date, courseName, players } = req.body ?? {};
        if (!date || !Array.isArray(players) || players.length === 0) {
            res.status(400).json({ error: 'date and a non-empty players array are required' });
            return;
        }

        const resolved: { memberId: number | null; guestName: string | null; score: number }[] = [];
        for (const p of players as RoundPlayerInput[]) {
            if (typeof p?.score !== 'number') {
                res.status(400).json({ error: 'every player needs a numeric score' });
                return;
            }
            let memberId: number | null = null;
            if (p.memberId) {
                const member = await prisma.member.findUnique({ where: { id: p.memberId } });
                if (member) memberId = member.id;
            }
            if (!memberId && p.name) {
                const member = await prisma.member.findFirst({ where: { name: p.name } });
                if (member) memberId = member.id;
            }
            if (!memberId && !p.name) {
                res.status(400).json({ error: 'every player needs a memberId or a name' });
                return;
            }
            resolved.push({ memberId, guestName: memberId ? null : (p.name ?? null), score: p.score });
        }

        const session = await prisma.$transaction(async tx => {
            const created = await tx.roundSession.create({
                data: { date: String(date), courseName: courseName ? String(courseName) : null },
            });
            await tx.round.createMany({
                data: resolved.map(r => ({
                    sessionId: created.id,
                    memberId: r.memberId,
                    guestName: r.guestName,
                    date: String(date),
                    courseName: courseName ? String(courseName) : null,
                    score: r.score,
                })),
            });
            return tx.roundSession.findUnique({
                where: { id: created.id },
                include: { scores: { include: { member: { select: { name: true } } } } },
            });
        });

        res.status(201).json(session ? toSessionShape(session) : null);
    } catch (error) {
        console.error('Error saving round:', error);
        res.status(500).json({ error: 'Failed to save round' });
    }
});

// DELETE /api/rounds/:id — admin removes one outing and all of its scores.
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await prisma.roundSession.delete({ where: { id: Number(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting round:', error);
        res.status(500).json({ error: 'Failed to delete round' });
    }
});

// GET /api/rounds/member/:memberId — one member's recorded scores + summary.
// This replaces the old client-side mock statistics.
router.get('/member/:memberId', async (req: Request, res: Response) => {
    try {
        const memberId = Number(req.params.memberId);
        const rounds = await prisma.round.findMany({
            where: { memberId },
            orderBy: { date: 'desc' },
        });
        const scores = rounds.map(r => r.score);
        res.json({
            memberId,
            rounds: rounds.map(r => ({ id: r.id, date: r.date, courseName: r.courseName ?? '', score: r.score })),
            stats: scores.length
                ? {
                      count: scores.length,
                      avgScore: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
                      bestScore: Math.min(...scores),
                      recentScores: scores.slice(0, 5),
                  }
                : { count: 0, avgScore: null, bestScore: null, recentScores: [] },
        });
    } catch (error) {
        console.error('Error fetching member rounds:', error);
        res.status(500).json({ error: 'Failed to fetch member rounds' });
    }
});

export default router;
