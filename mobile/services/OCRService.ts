import { Member, MemberService } from './MemberService';

export interface OCRResult {
    date: string;
    players: OCRPlayer[];
}

export interface OCRPlayer {
    originalName: string; // Name recognized from image
    matchedMemberId?: number; // Linked system member
    totalScore: number; // Only Total Score
}

export const OCRService = {
    /**
     * Simulate scanning a scorecard image
     * Returns mock data with Total Score only
     */
    scanScorecard: async (imageUri: string): Promise<OCRResult> => {
        console.log(`Scanning image: ${imageUri}`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Data: Total Scores
        const mockPlayers = [
            { name: '홍길동', totalScore: 85 },
            { name: '김골프', totalScore: 92 },
            { name: '이싱글', totalScore: 79 },
            { name: '박보기', totalScore: 105 }
        ];

        // Fetch real members to perform "Auto-Matching"
        const members = await MemberService.getMembers();

        const players: OCRPlayer[] = mockPlayers.map(p => {
            // Simple Fuzzy Match
            const match = members.find(m => m.name === p.name || m.name.includes(p.name) || p.name.includes(m.name));
            return {
                originalName: p.name,
                matchedMemberId: match ? match.id : undefined,
                totalScore: p.totalScore
            };
        });

        return {
            date: new Date().toISOString().split('T')[0],
            players
        };
    }
};
