export interface GolfCourse {
    id: number;
    name: string;
    location: string;
    distance: string; // Mock distance string for display
}



// Replace with your machine's local IP
const API_URL = 'http://192.168.10.107:3000/api/courses';

export const GolfCourseService = {
    /**
     * 골프장 검색 API (Backend)
     * @param query 검색어
     * @returns 골프장 목록 Promise
     */
    searchCourses: async (query: string): Promise<GolfCourse[]> => {
        try {
            if (!query.trim()) return [];

            const response = await fetch(`${API_URL}?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to search courses');
            }
            return await response.json();
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    },

    /**
     * 추천 골프장 가져오기 (초기 화면용 - Backend에서 상위 N개)
     */
    getRecommendedCourses: async (): Promise<GolfCourse[]> => {
        try {
            // query 없이 호출하면 Backend에서 기본 목록(seed된 상위 목록) 반환하도록 구현됨
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch recommended courses');
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch recommended courses:', error);
            return [];
        }
    },

    /**
     * 골프장 직접 추가
     */
    addCourse: async (name: string, location: string): Promise<GolfCourse | null> => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    location,
                    distance: '직접 추가됨' // Default value
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add course');
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to add course:', error);
            return null;
        }
    }
};
