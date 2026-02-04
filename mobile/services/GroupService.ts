import { Member } from './MemberService';

export interface Group {
    id: number;
    name: string; // e.g., "A조", "B조"
    members: Member[];
    avgHandicap: number;
    totalHandicap: number;
}

export interface GroupFormationResult {
    id: string; // UUID or Timestamp
    date: string;
    groups: Group[];
    memo?: string;
}

const MOCK_HISTORY: GroupFormationResult[] = [];

// Replace with your machine's local IP
const API_URL = 'http://192.168.10.107:3000/api/schedules';

export const GroupService = {
    /**
     * 조편성 결과 저장 (Backend)
     */
    saveFormation: async (groups: Group[], date: string, courseName: string = 'Unknown Course', time?: string): Promise<void> => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date,
                    time: time || '00:00', // Default time if not provided
                    courseName,
                    groups: groups.map(g => ({
                        name: g.name,
                        members: g.members
                    }))
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save formation');
            }
        } catch (error) {
            console.error('Error saving formation:', error);
            // Fallback to mock if needed, but for now just log
            const newResult: GroupFormationResult = {
                id: Date.now().toString(),
                date,
                groups,
            };
            MOCK_HISTORY.unshift(newResult);
        }
    },

    /**
     * 저장된 조편성 이력 가져오기 (Mock / Backend TODO)
     */
    getHistory: async (): Promise<GroupFormationResult[]> => {
        // This could also fetch from backend if we implement GET /api/schedules
        return [...MOCK_HISTORY];
    }
};
