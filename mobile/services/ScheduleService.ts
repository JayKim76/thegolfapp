import { Member, MemberService } from './MemberService';

export interface Group {
    id: number;
    name: string;
    members: Member[];
}

export interface Schedule {
    id: number;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    courseName: string;
    members: Member[]; // Participants
    groups: Group[];   // Group structure
}

// Mock Data
const MOCK_SCHEDULES: Schedule[] = [
    {
        id: 1,
        date: '2024-02-01',
        time: '07:00',
        courseName: '레이크사이드 CC',
        members: [],
        groups: []
    },
    {
        id: 2,
        date: '2026-02-20',
        time: '12:00',
        courseName: '남촌 CC',
        members: [],
        groups: []
    },
    {
        id: 3,
        date: '2026-03-01',
        time: '08:00',
        courseName: '안양 CC',
        members: [],
        groups: []
    }
];

// Replace with your machine's local IP
const API_URL = 'http://192.168.10.107:3000/api/schedules';

export const ScheduleService = {
    /**
     * Get all schedules
     */
    getSchedules: async (): Promise<Schedule[]> => {
        try {
            console.log(`Fetching schedules from ${API_URL}`);
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Transform backend data to frontend model
            return data.map((item: any) => ({
                id: item.id,
                date: item.date,
                time: item.time,
                courseName: item.courseName,
                members: item.groups.flatMap((g: any) => g.members), // Flatten all group members
                groups: item.groups // Preserve group structure
            }));
        } catch (error) {
            console.warn('Backend connection failed, falling back to mock data:', error);
            // Return mock data ONLY if backend fails
            return [...MOCK_SCHEDULES];
        }
    },

    deleteSchedule: async (id: number): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to delete schedule', error);
            throw error;
        }
    }
};
