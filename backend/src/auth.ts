import { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Club-admin model
// ---------------------------------------------------------------------------
// This service is NOT a per-user app. There is exactly one club ("모임") and
// one admin account that manages every member, schedule, grouping and score.
// Members are managed records — they do not have accounts and never log in.
//
// Configuration (backend/.env):
//   ADMIN_ID       admin login id            (default: "admin")
//   ADMIN_PASSWORD admin login password      (default: "1234" — DEV ONLY,
//                                             always set a real one in prod)
//   ADMIN_TOKEN    token issued after login  (default: "dev-admin-token")
// ---------------------------------------------------------------------------

export const ADMIN_ID = process.env.ADMIN_ID || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-admin-token';

if (!process.env.ADMIN_PASSWORD) {
    console.warn('[auth] ADMIN_PASSWORD is not set. Using the dev default password. Set ADMIN_PASSWORD in backend/.env before real use.');
}

// POST /api/auth/login  { id, password } -> { token, role: 'admin' }
export function adminLogin(req: Request, res: Response) {
    const { id, password } = req.body ?? {};
    if (id === ADMIN_ID && password === ADMIN_PASSWORD) {
        res.json({ token: ADMIN_TOKEN, role: 'admin', adminId: ADMIN_ID });
        return;
    }
    res.status(401).json({ error: 'Invalid admin credentials' });
}

// Middleware: only the logged-in admin may write (POST/PUT/PATCH/DELETE).
// Reads (GET) stay open so the app can render lists without a session.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'GET' || req.method === 'OPTIONS') {
        next();
        return;
    }
    const header = req.header('x-admin-token') || req.header('authorization')?.replace(/^Bearer\s+/i, '');
    if (header && header === ADMIN_TOKEN) {
        next();
        return;
    }
    res.status(401).json({ error: 'Admin login required for this action' });
}
