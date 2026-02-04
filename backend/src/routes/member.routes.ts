import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all members with filters
router.get('/', async (req, res) => {
    try {
        const { gender, type, search, sort } = req.query;

        const where: any = {
            status: 'active'
        };

        if (gender && typeof gender === 'string' && gender !== '전체') {
            where.gender = gender;
        }

        if (type && typeof type === 'string' && type !== '전체') {
            where.type = type;
        }

        if (search && typeof search === 'string') {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        let orderBy: any = { id: 'desc' };
        if (sort === 'name') {
            orderBy = { name: 'asc' };
        } else if (sort === 'handicap') {
            orderBy = { handicap: 'asc' }; // Low handicap is better/higher rank usually, but 'asc' sorts 0..30
        } else if (sort === 'joinDate') {
            orderBy = { joinDate: 'desc' };
        }

        const members = await prisma.member.findMany({
            where,
            orderBy
        });

        const formattedMembers = members.map(m => ({
            ...m,
            badges: m.badges ? JSON.parse(m.badges) : []
        }));

        res.json(formattedMembers);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Add a new member
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, handicap, gender, type, badges } = req.body;

        const newMember = await prisma.member.create({
            data: {
                name,
                email,
                phone,
                handicap: Number(handicap) || 0,
                gender: gender || 'male',
                type: type || '정회원',
                badges: badges ? JSON.stringify(badges) : '[]',
                joinDate: new Date(),
                status: 'active'
            }
        });

        res.status(201).json(newMember);
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ error: 'Failed to create member' });
    }
});

// Update a member
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, handicap, gender, type, badges, intro } = req.body;

        const updatedMember = await prisma.member.update({
            where: { id: Number(id) },
            data: {
                name,
                email,
                phone,
                handicap: handicap !== undefined ? Number(handicap) : undefined,
                gender,
                type,
                badges: badges ? JSON.stringify(badges) : undefined,
                intro
            }
        });

        res.json(updatedMember);
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: 'Failed to update member' });
    }
});

// Delete a member
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.member.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

export default router;
