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

// Replace with your machine's local IP if testing on physical device
const API_URL = 'http://192.168.10.107:3000/api/members';

const MOCK_MEMBERS: Member[] = [];

export const MemberService = {
    /**
     * 전체 회원 목록 가져오기
     */
    getMembers: async (sort: string = 'id'): Promise<Member[]> => {
        try {
            const url = `${API_URL}?sort=${sort}`;
            console.log(`Fetching members from ${url}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.warn('Backend connection failed:', error);
            return [];
        }
    },

    /**
     * 회원 검색
     * (Backend supports 'search' param, but we can also filter client-side if we fetch all.
     * For now, let's use the API filter if possible, or just re-use getMembers for simplicity if the API doesn't support complex search yet.)
     *
     * Actually, our backend supports `?search=query`.
     */
    searchMembers: async (query: string): Promise<Member[]> => {
        try {
            if (!query.trim()) return MemberService.getMembers();

            const url = `${API_URL}?search=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.warn('Search failed, falling back to local filter:', error);
            // Fallback local filtering
            const lowerQuery = query.toLowerCase().trim();
            return MOCK_MEMBERS.filter(member =>
                member.name.toLowerCase().includes(lowerQuery) ||
                member.email.toLowerCase().includes(lowerQuery) ||
                member.phone.includes(lowerQuery)
            );
        }
    },

    /**
     * 회원 추가
     */
    addMember: async (member: Partial<Member>): Promise<void> => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(member),
            });
            if (!response.ok) {
                throw new Error('Failed to create member');
            }
        } catch (error) {
            console.error('Add member failed:', error);
            // Fallback mock add
            const newId = Math.max(...MOCK_MEMBERS.map(m => m.id), 0) + 1;
            const newMember = { ...member, id: newId, status: 'active' } as Member;
            MOCK_MEMBERS.unshift(newMember);
            throw error; // Rethrow to notify UI potentially, or just swallow if we want seamless offline (but consistency issues)
            // For now, let's just log it and maybe alert user in UI
        }
    },

    /**
     * 회원 정보 수정
     */
    updateMember: async (id: number, member: Partial<Member>): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(member),
            });
            if (!response.ok) {
                throw new Error('Failed to update member');
            }
        } catch (error) {
            console.error('Update member failed:', error);
            // Fallback mock update
            const index = MOCK_MEMBERS.findIndex(m => m.id === id);
            if (index !== -1) {
                MOCK_MEMBERS[index] = { ...MOCK_MEMBERS[index], ...member };
            }
            throw error;
        }
    },

    /**
     * 회원 삭제
     */
    deleteMember: async (id: number): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete member');
            }
        } catch (error) {
            console.error('Delete member failed:', error);
            // Fallback mock delete
            const index = MOCK_MEMBERS.findIndex(m => m.id === id);
            if (index !== -1) MOCK_MEMBERS.splice(index, 1);
            throw error;
        }
    }
};
