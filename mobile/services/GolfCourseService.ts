export interface GolfCourse {
    id: number;
    name: string;
    location: string;
    distance: string; // Mock distance string for display
}

// 대량의 한국 골프장 더미 데이터
const MOCK_COURSES: GolfCourse[] = [
    // 수도권
    { id: 1, name: '안양 컨트리클럽', location: '경기도 군포시', distance: '12km' },
    { id: 2, name: '웰링턴 컨트리클럽', location: '경기도 이천시', distance: '45km' },
    { id: 3, name: '해슬리 나인브릿지', location: '경기도 여주시', distance: '52km' },
    { id: 4, name: '잭니클라우스 골프클럽 코리아', location: '인천광역시 연수구', distance: '35km' },
    { id: 5, name: '트리니티 클럽', location: '경기도 여주시', distance: '55km' },
    { id: 6, name: '곤지암 골프클럽', location: '경기도 광주시', distance: '38km' },
    { id: 7, name: '남촌 골프클럽', location: '경기도 광주시', distance: '40km' },
    { id: 8, name: '레이크사이드 컨트리클럽', location: '경기도 용인시', distance: '28km' },
    { id: 9, name: '화산 컨트리클럽', location: '경기도 용인시', distance: '42km' },
    { id: 10, name: '블루원 용인 양지', location: '경기도 용인시', distance: '48km' },
    { id: 11, name: '88 컨트리클럽', location: '경기도 용인시', distance: '25km' },
    { id: 12, name: '기흥 컨트리클럽', location: '경기도 화성시', distance: '32km' },
    { id: 13, name: '남서울 컨트리클럽', location: '경기도 성남시', distance: '15km' },
    { id: 14, name: '뉴서울 컨트리클럽', location: '경기도 광주시', distance: '22km' },
    { id: 15, name: '서원밸리 컨트리클럽', location: '경기도 파주시', distance: '45km' },
    { id: 16, name: '송추 컨트리클럽', location: '경기도 양주시', distance: '38km' },
    { id: 17, name: '스카이72 골프 앤 리조트 (클럽72)', location: '인천광역시 중구', distance: '40km' },
    { id: 18, name: '베어즈베스트 청라', location: '인천광역시 서구', distance: '30km' },
    { id: 19, name: '제이드팰리스 골프클럽', location: '강원도 춘천시', distance: '65km' },
    { id: 20, name: '휘슬링락 컨트리클럽', location: '강원도 춘천시', distance: '68km' },

    // 강원도
    { id: 21, name: '설해원', location: '강원도 양양군', distance: '150km' },
    { id: 22, name: '세이지우드 홍천', location: '강원도 홍천군', distance: '85km' },
    { id: 23, name: '라비에벨 골프 앤 리조트', location: '강원도 춘천시', distance: '70km' },
    { id: 24, name: '파인리즈 리조트', location: '강원도 고성군', distance: '180km' },
    { id: 25, name: '델피노 컨트리클럽', location: '강원도 고성군', distance: '175km' },

    // 충청도
    { id: 26, name: '우정힐스 컨트리클럽', location: '충청남도 천안시', distance: '85km' },
    { id: 27, name: '천룡 컨트리클럽', location: '충청북도 진천군', distance: '90km' },
    { id: 28, name: '레인보우힐스 컨트리클럽', location: '충청북도 음성군', distance: '95km' },
    { id: 29, name: '킹스데일 골프클럽', location: '충청북도 충주시', distance: '100km' },
    { id: 30, name: '세종 필드 골프클럽', location: '세종특별자치시', distance: '120km' },

    // 전라도
    { id: 31, name: '파인비치 골프링크스', location: '전라남도 해남군', distance: '320km' },
    { id: 32, name: '사우스링크스 영암', location: '전라남도 영암군', distance: '300km' },
    { id: 33, name: 'JNJ 골프리조트', location: '전라남도 장흥군', distance: '310km' },
    { id: 34, name: '승주 컨트리클럽', location: '전라남도 순천시', distance: '280km' },
    { id: 35, name: '상무대 체력단련장', location: '전라남도 장성군', distance: '250km' }, // 군 골프장 예시

    // 경상도
    { id: 36, name: '사우스케이프 오너스클럽', location: '경상남도 남해군', distance: '350km' },
    { id: 37, name: '동래 베네스트', location: '부산광역시 금정구', distance: '380km' },
    { id: 38, name: '해운대비치 골프앤리조트', location: '부산광역시 기장군', distance: '390km' },
    { id: 39, name: '블루원 디아너스', location: '경상북도 경주시', distance: '330km' },
    { id: 40, name: '드비치 골프클럽', location: '경상남도 거제시', distance: '360km' },

    // 제주도
    { id: 41, name: '클럽 나인브릿지 (제주)', location: '제주특별자치도 서귀포시', distance: '450km' },
    { id: 42, name: '핀크스 골프클럽', location: '제주특별자치도 서귀포시', distance: '455km' },
    { id: 43, name: '블랙스톤 제주', location: '제주특별자치도 제주시', distance: '445km' },
    { id: 44, name: '롯데스카이힐 제주', location: '제주특별자치도 서귀포시', distance: '460km' },
    { id: 45, name: '엘리시안 제주', location: '제주특별자치도 제주시', distance: '450km' },
    { id: 46, name: '테디밸리 골프앤리조트', location: '제주특별자치도 서귀포시', distance: '458km' },

    // 기타 (해외 유명 코스 - 검색 테스트용)
    { id: 901, name: '페블비치 골프 링크스', location: '미국 캘리포니아', distance: '9,500km' },
    { id: 902, name: '오거스타 내셔널', location: '미국 조지아', distance: '11,000km' },
    { id: 903, name: '센트앤드류스 올드코스', location: '스코틀랜드', distance: '8,800km' },
];

export const GolfCourseService = {
    /**
     * 골프장 검색 API (Mock)
     * @param query 검색어
     * @returns 골프장 목록 Promise
     */
    searchCourses: async (query: string): Promise<GolfCourse[]> => {
        return new Promise((resolve) => {
            // 실제 API 호출 딜레이 시뮬레이션 (300ms ~ 800ms)
            const delay = Math.floor(Math.random() * 500) + 300;

            setTimeout(() => {
                if (!query.trim()) {
                    // 검색어 없으면 빈 배열 혹은 추천/최근 목록 반환 (여기선 빈 배열)
                    resolve([]);
                    return;
                }

                const lowerQuery = query.toLowerCase().trim();
                const results = MOCK_COURSES.filter(course =>
                    course.name.toLowerCase().includes(lowerQuery) ||
                    course.location.toLowerCase().includes(lowerQuery)
                );

                resolve(results);
            }, delay);
        });
    },

    /**
     * 추천 골프장 가져오기 (초기 화면용)
     */
    getRecommendedCourses: async (): Promise<GolfCourse[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 상위 몇 개만 랜덤하게 혹은 고정적으로 반환
                resolve(MOCK_COURSES.slice(0, 10)); // 상위 10개만 추천으로 표시
            }, 500);
        });
    }
};
