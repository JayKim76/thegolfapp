
import { Member, Round, ScoreEntry } from './types';

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    name: '김골프',
    handicap: 12,
    type: '정회원',
    status: 'active',
    lastRound: '2일 전',
    avatar: 'https://picsum.photos/seed/golf1/200',
    gender: 'male'
  },
  {
    id: '2',
    name: '이프로',
    handicap: 4,
    type: '티칭프로',
    status: 'active',
    avatar: 'https://picsum.photos/seed/golf2/200',
    gender: 'female'
  },
  {
    id: '3',
    name: '박아마',
    handicap: 28,
    type: '일반회원',
    status: 'inactive',
    joinDate: '2023.05.10',
    avatar: 'https://picsum.photos/seed/golf3/200',
    gender: 'male'
  },
  {
    id: '4',
    name: '최보기',
    handicap: 24,
    type: '일반회원',
    status: 'active',
    avatar: 'https://picsum.photos/seed/golf4/200',
    gender: 'male'
  },
  {
    id: '5',
    name: '정나이스',
    handicap: 15,
    type: '정회원',
    status: 'active',
    avatar: 'https://picsum.photos/seed/golf5/200',
    gender: 'female'
  }
];

export const MOCK_ROUNDS: Round[] = [
  {
    id: 'r1',
    courseName: '스카이 72 골프 클럽',
    location: '인천광역시 중구',
    date: '10월 24일 (토)',
    teeOff: '오전 07:00',
    status: 'confirmed',
    attendees: ['1', '2', '5', '4'],
    image: 'https://picsum.photos/seed/sky72/800/400'
  }
];

export const MOCK_HISTORY: ScoreEntry[] = [
  { id: 'h1', courseName: '레이크사이드 CC', date: '2023. 10. 15', score: 98, parDiff: 13 },
  { id: 'h2', courseName: '안양 베네스트', date: '2023. 10. 08', score: 102, parDiff: 18 },
  { id: 'h3', courseName: '가평 베네스트', date: '2023. 09. 22', score: 79, parDiff: 7 }
];
