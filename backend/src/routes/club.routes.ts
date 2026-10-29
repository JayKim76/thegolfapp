import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAdmin } from '../auth';

const router = Router();

export const DEFAULT_CLUB_NAME = 'EagleView 골프 모임';

// The whole service belongs to a single club. Return it, creating the
// singleton row on first use so a fresh database works without seeding.
export async function getOrCreateClub() {
    const existing = await prisma.club.findFirst({ orderBy: { id: 'asc' } });
    if (existing) return existing;
    return prisma.club.create({ data: { name: DEFAULT_CLUB_NAME } });
}

// GET /api/club — club info + member count
router.get('/', async (req, res) => {
    try {
        const club = await getOrCreateClub();
        const memberCount = await prisma.member.count({ where: { clubId: club.id } });
        res.json({ ...club, memberCount });
    } catch (error) {
        console.error('Error fetching club:', error);
        res.status(500).json({ error: 'Failed to fetch club' });
    }
});

// PUT /api/club — admin only: rename the club / edit its description
router.put('/', requireAdmin, async (req, res) => {
    try {
        const club = await getOrCreateClub();
        const { name, description } = req.body ?? {};
        const updated = await prisma.club.update({
            where: { id: club.id },
            data: {
                name: typeof name === 'string' && name.trim() ? name.trim() : undefined,
                description: typeof description === 'string' ? description : undefined,
            },
        });
        res.json(updated);
    } catch (error) {
        console.error('Error updating club:', error);
        res.status(500).json({ error: 'Failed to update club' });
    }
});

// GET /api/club/stats — everything the admin home dashboard shows.
// All figures are club-wide aggregates over ALL members (no "my stats").
router.get('/stats', async (req, res) => {
    try {
        const club = await getOrCreateClub();
        const where = { clubId: club.id };

        const [totalMembers, activeMembers, maleMembers, femaleMembers, handicapAgg, totalSchedules, totalRounds, nextSchedule] =
            await Promise.all([
                prisma.member.count({ where }),
                prisma.member.count({ where: { ...where, status: 'active' } }),
                prisma.member.count({ where: { ...where, gender: 'male' } }),
                prisma.member.count({ where: { ...where, gender: 'female' } }),
                prisma.member.aggregate({ where, _avg: { handicap: true }, _min: { handicap: true } }),
                prisma.schedule.count(),
                prisma.round.count(),
                prisma.schedule.findFirst({
                    orderBy: { date: 'asc' },
                    include: { groups: { include: { members: true } } },
                }),
            ]);

        // Best (lowest) handicap member — the club's current No.1
        const topMember = await prisma.member.findFirst({
            where,
            orderBy: { handicap: 'asc' },
        });

        res.json({
            club: { id: club.id, name: club.name, description: club.description },
            members: {
                total: totalMembers,
                active: activeMembers,
                male: maleMembers,
                female: femaleMembers,
                avgHandicap: handicapAgg._avg.handicap ? Number(handicapAgg._avg.handicap.toFixed(1)) : null,
                topMember: topMember ? { id: topMember.id, name: topMember.name, handicap: topMember.handicap } : null,
            },
            schedules: { total: totalSchedules, next: nextSchedule },
            rounds: { totalRecordedScores: totalRounds },
        });
    } catch (error) {
        console.error('Error fetching club stats:', error);
        res.status(500).json({ error: 'Failed to fetch club stats' });
    }
});

export default router;
