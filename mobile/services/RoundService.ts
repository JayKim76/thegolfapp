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

import { API_BASE, AuthService } from './AuthService';

const API_URL = `${API_BASE}/api/rounds`;

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
                    ...AuthService.authHeaders(),
                },
                body: JSON.stringify(round),
            });

            if (!response.ok) {
                throw new Error('Failed to save round');
            }

            const newRound = await response.json();
            return newRound;
        } catch (error) {
            // Rounds live in the backend DB now. A failed save must surface
            // as an error — silently keeping it on the device would lose it.
            console.error('Save round failed:', error);
            throw error;
        }
    },

    /**
     * Delete one recorded round (admin). Removes all of its player scores.
     */
    deleteRound: async (roundId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/${roundId}`, {
            method: 'DELETE',
            headers: { ...AuthService.authHeaders() },
        });
        if (!response.ok) {
            throw new Error('Failed to delete round');
        }
    },

    /**
     * One member's recorded scores and summary, computed by the backend
     * from the stored Round rows.
     */
    getMemberStats: async (memberId: number) => {
        const response = await fetch(`${API_URL}/member/${memberId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch member stats');
        }
        const data = await response.json();
        return data.stats as {
            count: number;
            avgScore: number | null;
            bestScore: number | null;
            recentScores: number[];
        };
    }
};
