import { Router, Request, Response } from 'express';

const router = Router();

// Mock Data Storage (In-memory persistence for server lifecycle)
// Ensure we have the same structure as the frontend expects
interface RoundPlayer {
    memberId?: number;
    name: string;
    score: number;
    diff?: number;
}

interface Round {
    id: number;
    date: string;
    courseName: string;
    players: RoundPlayer[];
}

let MOCK_ROUNDS: Round[] = [];

// GET: Get all rounds
router.get('/', (req: Request, res: Response) => {
    // Sort by date descending
    const sorted = [...MOCK_ROUNDS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(sorted);
});

// POST: Save a new round
router.post('/', (req: Request, res: Response) => {
    try {
        const roundData = req.body;

        // Basic Validation
        if (!roundData.date || !roundData.players) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const newRound: Round = {
            ...roundData,
            id: Date.now(), // Generate ID
        };

        MOCK_ROUNDS.unshift(newRound);
        console.log('New Round Created:', newRound);

        res.status(201).json(newRound);
    } catch (error) {
        console.error('Error saving round:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
