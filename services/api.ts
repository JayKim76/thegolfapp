// Web admin console API client.
// Talks to the thegolfapp backend (Express + Prisma + Supabase Postgres).
// Base URL: VITE_API_BASE at build time (e.g. https://thegolfapp-api.vercel.app).
// Empty means same origin. The admin token lives only in localStorage.

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const TOKEN_KEY = 'thegolfapp-admin-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(getToken() ? { 'x-admin-token': getToken()! } : {}),
            ...(options.headers || {}),
        },
    });
    const data: any = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(data?.message || data?.error || `요청 실패 (${res.status})`);
    }
    return data as T;
}

export interface ApiMember {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    gender: string;
    handicap: number;
    status: string;
    type: string;
    joinDate: string;
}

// Real shape of GET /api/rounds: sessions with a players array.
// Aggregates (count / best / average) are computed by the caller.
export interface ApiRoundSession {
    id: number | null;
    date: string;
    courseName: string;
    players: { memberId: number | null; name: string; score: number }[];
}

export const api = {
    login: (id: string, password: string) =>
        req<{ token: string; adminId: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ id, password }),
        }),
    getClub: () => req<{ id: number; name: string; memberCount: number }>('/api/club'),
    updateClubName: (name: string) =>
        req('/api/club', { method: 'PUT', body: JSON.stringify({ name }) }),
    // Real shape of GET /api/club/stats is nested (club/members/schedules/rounds).
    getStats: () =>
        req<{
            club: { id: number; name: string };
            members: {
                total: number;
                active: number;
                male: number;
                female: number;
                avgHandicap: number | null;
                topMember: { name: string; handicap: number } | null;
            };
            schedules: { total: number; next: unknown };
            rounds: { totalRecordedScores: number };
        }>('/api/club/stats'),
    getMembers: () => req<ApiMember[]>('/api/members'),
    createMember: (data: Partial<ApiMember>) =>
        req<ApiMember>('/api/members', { method: 'POST', body: JSON.stringify(data) }),
    updateMember: (id: number, data: Partial<ApiMember>) =>
        req<ApiMember>(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMember: (id: number) => req(`/api/members/${id}`, { method: 'DELETE' }),
    getSchedules: () => req<any[]>('/api/schedules'),
    getCourses: () =>
        req<{ id: number; name: string; location: string; distance?: string | null }[]>('/api/courses'),
    getRounds: () => req<ApiRoundSession[]>('/api/rounds'),
    // One member's full score history + summary (GET /api/rounds/member/:id)
    getMemberRounds: (memberId: number) =>
        req<{
            memberId: number;
            rounds: { id: number; date: string; courseName: string; score: number }[];
            stats: {
                count: number;
                avgScore: number | null;
                bestScore: number | null;
                recentScores: number[];
            };
        }>(`/api/rounds/member/${memberId}`),
    createRound: (payload: {
        date: string;
        courseName: string;
        players: { memberId?: number; name?: string; score: number }[];
    }) => req('/api/rounds', { method: 'POST', body: JSON.stringify(payload) }),
    ocrScorecard: (imageBase64: string, mimeType: string) =>
        req<{
            date: string | null;
            courseName: string | null;
            players: { name: string; totalScore: number }[];
        }>('/api/ocr/scorecard', {
            method: 'POST',
            body: JSON.stringify({ imageBase64, mimeType }),
        }),
};
