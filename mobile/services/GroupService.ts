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

// Mock Storage
const MOCK_HISTORY: GroupFormationResult[] = [];

export const GroupService = {
    /**
     * 조편성 결과 저장
     */
    saveFormation: async (groups: Group[], date: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newResult: GroupFormationResult = {
                    id: Date.now().toString(),
                    date,
                    groups,
                };
                MOCK_HISTORY.unshift(newResult);
                console.log('Saved Formation:', newResult);
                resolve();
            }, 500);
        });
    },

    /**
     * 저장된 조편성 이력 가져오기
     */
    getHistory: async (): Promise<GroupFormationResult[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...MOCK_HISTORY]);
            }, 500);
        });
    }
};
