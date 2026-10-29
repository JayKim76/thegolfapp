// ---------------------------------------------------------------------------
// Club-admin model
// ---------------------------------------------------------------------------
// This app has ONE account: the club admin. The admin manages every member
// of a single club (모임) — members are managed records, they have no
// accounts and never log in, so there is no sign-up flow anywhere in the app.
// ---------------------------------------------------------------------------

// Replace with your machine's local IP if testing on a physical device
export const API_BASE = 'http://192.168.10.107:3000';

let adminToken: string | null = null;

export const AuthService = {
    /** Admin login against the backend. Falls back to the dev credential
     *  check when the backend is unreachable (local development only —
     *  the backend still rejects writes that carry no valid token). */
    login: async (id: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id.trim(), password }),
            });
            if (!response.ok) return false;
            const data = await response.json();
            adminToken = data.token;
            return true;
        } catch (error) {
            console.warn('Backend login failed, using dev fallback:', error);
            if (id.trim() === 'admin' && password === '1234') {
                adminToken = 'dev-admin-token';
                return true;
            }
            return false;
        }
    },

    logout: () => {
        adminToken = null;
    },

    isLoggedIn: () => adminToken !== null,

    /** Headers every write request must carry. The backend enforces the
     *  admin token on all non-GET /api routes. */
    authHeaders: (): Record<string, string> =>
        adminToken ? { 'x-admin-token': adminToken } : {},
};
