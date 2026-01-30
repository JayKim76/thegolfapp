
export interface Member {
  id: string;
  name: string;
  handicap: number;
  type: '정회원' | '티칭프로' | '일반회원' | '휴면회원';
  status: 'active' | 'inactive';
  lastRound?: string;
  joinDate?: string;
  avatar: string;
  gender: 'male' | 'female';
}

export interface Round {
  id: string;
  courseName: string;
  location: string;
  date: string;
  teeOff: string;
  status: 'confirmed' | 'pending';
  attendees: string[]; // Member IDs
  image: string;
}

export interface ScoreEntry {
  id: string;
  courseName: string;
  date: string;
  score: number;
  parDiff: number;
}
