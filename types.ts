
export interface Member {
  id: string;
  name: string;
  handicap: number;
  type: string;
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
