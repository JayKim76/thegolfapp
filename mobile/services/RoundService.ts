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

// Mock Data Storage (Empty for production-like behavior, will use API)
let MOCK_ROUNDS: Round[] = [];

// Replace with your machine's local IP if testing on physical device
const API_URL = 'http://192.168.10.107:3000/api/rounds';

export const RoundService = {
    /**
     * Get all past rounds
     */
    getRounds: async (): Promise<Round[]> => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch rounds');
            }
            return await response.json();
        } catch (error) {
            console.warn('Backend connection failed:', error);
            // Return empty array on failure if no persistence
            return [];
        }
    },

    /**
     * Save a new round
     */
    saveRound: async (round: Omit<Round, 'id'>): Promise<Round> => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(round),
            });

            if (!response.ok) {
                throw new Error('Failed to save round');
            }

            const newRound = await response.json();
            return newRound;
        } catch (error) {
            console.error('Save round failed:', error);
            // Fallback mock logic for demo if server fails
            const newRound = {
                ...round,
                id: Date.now(),
            };
            MOCK_ROUNDS.unshift(newRound);
            return newRound;
        }
    },

    /**
     * Get statistics for a specific member (Mock)
     */
    getMemberStats: async (memberId: number) => {
        // This could be moved to backend too, but keeping mock for now as requested task was just saving/lookup
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            avgScore: 82.4,
            handicap: 12,
            bestScore: 78
        };
    }
};
