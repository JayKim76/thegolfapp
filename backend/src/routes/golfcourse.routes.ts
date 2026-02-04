import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Initial Mock Data to Seed
const MOCK_COURSES = [
    { name: '안양 컨트리클럽', location: '경기도 군포시', distance: '12km' },
    { name: '웰링턴 컨트리클럽', location: '경기도 이천시', distance: '45km' },
    { name: '해슬리 나인브릿지', location: '경기도 여주시', distance: '52km' },
    { name: '잭니클라우스 골프클럽 코리아', location: '인천광역시 연수구', distance: '35km' },
    { name: '트리니티 클럽', location: '경기도 여주시', distance: '55km' },
    { name: '곤지암 골프클럽', location: '경기도 광주시', distance: '38km' },
    { name: '남촌 골프클럽', location: '경기도 광주시', distance: '40km' },
    { name: '레이크사이드 컨트리클럽', location: '경기도 용인시', distance: '28km' },
    { name: '화산 컨트리클럽', location: '경기도 용인시', distance: '42km' },
    { name: '블루원 용인 양지', location: '경기도 용인시', distance: '48km' },
    { name: '88 컨트리클럽', location: '경기도 용인시', distance: '25km' },
    { name: '기흥 컨트리클럽', location: '경기도 화성시', distance: '32km' },
    { name: '남서울 컨트리클럽', location: '경기도 성남시', distance: '15km' },
    { name: '뉴서울 컨트리클럽', location: '경기도 광주시', distance: '22km' },
    { name: '서원밸리 컨트리클럽', location: '경기도 파주시', distance: '45km' },
    { name: '송추 컨트리클럽', location: '경기도 양주시', distance: '38km' },
    { name: '스카이72 (클럽72)', location: '인천광역시 중구', distance: '40km' },
    { name: '베어즈베스트 청라', location: '인천광역시 서구', distance: '30km' },
    { name: '제이드팰리스 골프클럽', location: '강원도 춘천시', distance: '65km' },
    { name: '휘슬링락 컨트리클럽', location: '강원도 춘천시', distance: '68km' },
    { name: '설해원', location: '강원도 양양군', distance: '150km' },
    { name: '세이지우드 홍천', location: '강원도 홍천군', distance: '85km' },
    { name: '라비에벨 골프 앤 리조트', location: '강원도 춘천시', distance: '70km' },
    { name: '우정힐스 컨트리클럽', location: '충청남도 천안시', distance: '85km' },
    { name: '사우스케이프 오너스클럽', location: '경상남도 남해군', distance: '350km' },
    { name: '클럽 나인브릿지 (제주)', location: '제주특별자치도', distance: '450km' },
    { name: '핀크스 골프클럽', location: '제주특별자치도', distance: '455km' },
    { name: '블랙스톤 제주', location: '제주특별자치도', distance: '445km' },
];

// Search Courses
router.get('/', async (req, res) => {
    try {
        const { query } = req.query;

        // Auto-seed if empty
        const count = await prisma.golfCourse.count();
        if (count === 0) {
            console.log('Seeding Golf Courses...');
            await prisma.golfCourse.createMany({ data: MOCK_COURSES });
        }

        let whereClause = {};
        if (query) {
            whereClause = {
                OR: [
                    { name: { contains: String(query) } }, // Remove mode: 'insensitive' for sqlite compatibility if needed, but normally Prisma handles it or we accept case sensitivity for now
                    { location: { contains: String(query) } }
                ]
            };
        }

        const courses = await prisma.golfCourse.findMany({
            where: whereClause,
            take: 20 // Limit results
        });
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Add Course
router.post('/', async (req, res) => {
    try {
        const { name, location, distance } = req.body;
        const result = await prisma.golfCourse.create({
            data: { name, location, distance }
        });
        res.json(result);
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Failed to add course' });
    }
});

export default router;
