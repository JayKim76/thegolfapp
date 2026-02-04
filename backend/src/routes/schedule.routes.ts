import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all schedules
router.get('/', async (req, res) => {
    try {
        const schedules = await prisma.schedule.findMany({
            include: {
                groups: {
                    include: {
                        members: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        });
        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

// Create a new schedule (Group Formation)
router.post('/', async (req, res) => {
    const { date, time, courseName, groups } = req.body;

    try {
        const result = await prisma.schedule.create({
            data: {
                date,
                time,
                courseName,
                groups: {
                    create: groups.map((group: any) => ({
                        name: group.name,
                        members: {
                            connect: group.members.map((m: any) => ({ id: m.id }))
                        }
                    }))
                }
            },
            include: {
                groups: {
                    include: {
                        members: true
                    }
                }
            }
        });
        res.json(result);
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.schedule.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

export default router;
