export interface Member {
    id: number;
    name: string;
    email: string;
    handicap: number;
    phone: string;
    joinDate: string;
    status: 'active' | 'inactive';
    profileImage?: string; // URL or null
    badges?: string[];
    type?: string;
    intro?: string;
    gender?: 'male' | 'female';
}

const MOCK_MEMBERS: Member[] = [
    { id: 1, name: '홍길동', email: 'hong@example.com', handicap: 12, phone: '010-1234-5678', joinDate: '2023-01-15', status: 'active', badges: ['HDCP 12'], type: '정회원', gender: 'male' },
    { id: 2, name: '김철수', email: 'kim@example.com', handicap: 18, phone: '010-2345-6789', joinDate: '2023-02-20', status: 'active', badges: ['HDCP 18'], type: '준회원', gender: 'male' },
    { id: 3, name: '이영희', email: 'lee@example.com', handicap: 24, phone: '010-3456-7890', joinDate: '2023-03-10', status: 'active', badges: ['HDCP 24'], type: '정회원', gender: 'female' },
    { id: 4, name: '박민수', email: 'park@example.com', handicap: 8, phone: '010-4567-8901', joinDate: '2023-04-05', status: 'inactive', badges: [], type: '휴면회원', gender: 'male' },
    { id: 5, name: '최지우', email: 'choi@example.com', handicap: 15, phone: '010-5678-9012', joinDate: '2023-05-12', status: 'active', badges: [], type: '정회원', gender: 'female' },
    { id: 6, name: '정우성', email: 'jung@example.com', handicap: 5, phone: '010-6789-0123', joinDate: '2023-06-25', status: 'active', badges: ['PRO'], type: '티칭프로', gender: 'male' },
    { id: 7, name: '강동원', email: 'kang@example.com', handicap: 10, phone: '010-7890-1234', joinDate: '2023-07-30', status: 'active', badges: ['HDCP 10'], type: '정회원', gender: 'male' },
    { id: 8, name: '손예진', email: 'son@example.com', handicap: 20, phone: '010-8901-2345', joinDate: '2023-08-14', status: 'active', badges: [], type: '준회원', gender: 'female' },
    { id: 9, name: '현빈', email: 'hyun@example.com', handicap: 7, phone: '010-9012-3456', joinDate: '2023-09-01', status: 'active', badges: ['HDCP 7'], type: '정회원', gender: 'male' },
    { id: 10, name: '아이유', email: 'iu@example.com', handicap: 28, phone: '010-0123-4567', joinDate: '2023-10-03', status: 'active', badges: [], type: '정회원', gender: 'female' },
    // Truncated list for brevity, but ensuring types are covered
    { id: 11, name: '유재석', email: 'yoo@example.com', handicap: 16, phone: '010-1111-2222', joinDate: '2023-11-11', status: 'active', badges: ['HDCP 16'], type: '정회원', gender: 'male' },
    { id: 12, name: '강호동', email: 'kang_hd@example.com', handicap: 14, phone: '010-3333-4444', joinDate: '2023-12-25', status: 'active', badges: [], type: '준회원', gender: 'male' },
    { id: 13, name: '신동엽', email: 'shin@example.com', handicap: 18, phone: '010-5555-6666', joinDate: '2024-01-01', status: 'active', badges: [], type: '정회원', gender: 'male' },
    { id: 14, name: '박나래', email: 'park_nr@example.com', handicap: 22, phone: '010-7777-8888', joinDate: '2024-02-14', status: 'inactive', badges: [], type: '휴면회원', gender: 'female' },
    { id: 15, name: '장도연', email: 'jang@example.com', handicap: 25, phone: '010-9999-0000', joinDate: '2024-03-01', status: 'active', badges: [], type: '정회원', gender: 'female' },
    { id: 16, name: '이경규', email: 'lee_kk@example.com', handicap: 9, phone: '010-1212-3434', joinDate: '2024-03-15', status: 'active', badges: ['PRO'], type: '티칭프로', gender: 'male' },
    { id: 17, name: '김구라', email: 'kim_gr@example.com', handicap: 13, phone: '010-5656-7878', joinDate: '2024-04-05', status: 'active', badges: [], type: '정회원', gender: 'male' },
    { id: 18, name: '서장훈', email: 'seo@example.com', handicap: 11, phone: '010-9090-1212', joinDate: '2024-05-20', status: 'active', badges: [], type: '준회원', gender: 'male' },
    { id: 19, name: '김희철', email: 'kim_hc@example.com', handicap: 19, phone: '010-3434-5656', joinDate: '2024-06-10', status: 'active', badges: [], type: '정회원', gender: 'male' },
    { id: 20, name: '민경훈', email: 'min@example.com', handicap: 17, phone: '010-7878-9090', joinDate: '2024-07-07', status: 'active', badges: [], type: '정회원', gender: 'male' },
];

export const MemberService = {
    /**
     * 전체 회원 목록 가져오기 (Mock)
     */
    getMembers: async (): Promise<Member[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...MOCK_MEMBERS]);
            }, 600); // Network delay simulation
        });
    },

    /**
     * 회원 검색 (Mock)
     */
    searchMembers: async (query: string): Promise<Member[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lowerQuery = query.toLowerCase().trim();
                if (!lowerQuery) {
                    resolve([...MOCK_MEMBERS]);
                    return;
                }
                const results = MOCK_MEMBERS.filter(member =>
                    member.name.toLowerCase().includes(lowerQuery) ||
                    member.email.toLowerCase().includes(lowerQuery) ||
                    member.phone.includes(lowerQuery)
                );
                resolve(results);
            }, 400);
        });
    },

    /**
     * 회원 추가 (Mock)
     */
    addMember: async (member: Partial<Member>): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newId = Math.max(...MOCK_MEMBERS.map(m => m.id), 0) + 1;
                const newMember: Member = {
                    id: newId,
                    name: member.name || 'Unknown',
                    email: member.email || '',
                    handicap: member.handicap || 0,
                    phone: member.phone || '',
                    joinDate: new Date().toISOString().split('T')[0],
                    status: 'active',
                    profileImage: member.profileImage,
                    ...member // override if provided
                } as Member;

                // Add to beginning of list
                MOCK_MEMBERS.unshift(newMember);
                resolve();
            }, 500);
        });
    },

    /**
     * 회원 삭제 (Mock)
     */
    deleteMember: async (id: number): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = MOCK_MEMBERS.findIndex(m => m.id === id);
                if (index !== -1) {
                    MOCK_MEMBERS.splice(index, 1);
                }
                resolve();
            }, 500);
        });
    }
};
