export interface Round {
    id: number;
    date: string;
    courseName: string;
    players: RoundPlayer[];
}

export interface RoundPlayer {
    memberId?: number; // Optional, as guest might not have ID
    name: string;
    score: number;
    diff?: number; // Score difference from handicap or par (mocked for now)
}

// Mock Data Storage
let MOCK_ROUNDS: Round[] = [
    {
        id: 1,
        date: '2023-10-15',
        courseName: '레이크사이드 CC',
        players: [
            { id: 101, name: '김민수', score: 85, diff: 13 }, // User
            { id: 102, name: '이철수', score: 92 },
            { id: 103, name: '박영희', score: 88 },
            { id: 104, name: '최지훈', score: 90 }
        ]
    }
];

export const RoundService = {
    /**
     * Get all past rounds
     */
    getRounds: async (): Promise<Round[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...MOCK_ROUNDS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    /**
     * Save a new round
     */
    saveRound: async (round: Omit<Round, 'id'>): Promise<Round> => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const newRound = {
            ...round,
            id: Date.now(), // Simple ID generation
        };

        MOCK_ROUNDS.unshift(newRound);
        console.log('Round Saved:', newRound);
        return newRound;
    },

    /**
     * Get statistics for a specific member (Mock)
     */
    getMemberStats: async (memberId: number) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Calculate stats from MOCK_ROUNDS if needed, currently returning mock stats
        return {
            avgScore: 82.4,
            handicap: 12,
            bestScore: 78
        };
    }
};
