import { Member, MemberService } from './MemberService';

export interface Schedule {
    id: number;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    courseName: string;
    members: Member[]; // Participants
}

// Mock Data
const MOCK_SCHEDULES: Schedule[] = [
    {
        id: 1,
        date: '2026-02-15',
        time: '07:30',
        courseName: '레이크사이드 CC',
        members: [] // Will be populated in getSchedules ideally, or just mocked here
    },
    {
        id: 2,
        date: '2026-02-20',
        time: '12:00',
        courseName: '남촌 CC',
        members: []
    },
    {
        id: 3,
        date: '2026-03-01',
        time: '08:00',
        courseName: '안양 CC',
        members: []
    }
];

export const ScheduleService = {
    /**
     * 예약 일정 가져오기
     */
    getSchedules: async (): Promise<Schedule[]> => {
        // Populate members for mock display
        const allMembers = await MemberService.getMembers();
        const schedules = MOCK_SCHEDULES.map(s => ({
            ...s,
            members: allMembers.slice(0, 4) // Just take first 4 as mock participants
        }));

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(schedules);
            }, 400);
        });
    }
};
