import { API_BASE, AuthService } from './AuthService';

export interface Club {
    id: number;
    name: string;
    description?: string | null;
    memberCount?: number;
}

export interface ClubStats {
    club: { id: number; name: string; description?: string | null };
    members: {
        total: number;
        active: number;
        male: number;
        female: number;
        avgHandicap: number | null;
        topMember: { id: number; name: string; handicap: number } | null;
    };
    schedules: { total: number; next: any | null };
    rounds: { totalRecordedScores: number };
}

export const ClubService = {
    /** The single club this app belongs to. */
    getClub: async (): Promise<Club | null> => {
        try {
            const response = await fetch(`${API_BASE}/api/club`);
            if (!response.ok) throw new Error('Failed to fetch club');
            return await response.json();
        } catch (error) {
            console.warn('Failed to fetch club:', error);
            return null;
        }
    },

    /** Club-wide aggregates for the admin home dashboard. */
    getStats: async (): Promise<ClubStats | null> => {
        try {
            const response = await fetch(`${API_BASE}/api/club/stats`);
            if (!response.ok) throw new Error('Failed to fetch club stats');
            return await response.json();
        } catch (error) {
            console.warn('Failed to fetch club stats:', error);
            return null;
        }
    },

    /** Admin only: rename the club or edit its description. */
    updateClub: async (name: string, description?: string): Promise<Club | null> => {
        try {
            const response = await fetch(`${API_BASE}/api/club`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...AuthService.authHeaders() },
                body: JSON.stringify({ name, description }),
            });
            if (!response.ok) throw new Error('Failed to update club');
            return await response.json();
        } catch (error) {
            console.error('Failed to update club:', error);
            return null;
        }
    },
};
