import 'dotenv/config'; // MUST stay first: loads backend/.env before auth/ocr modules read process.env
import express from 'express';
import cors from 'cors';
import { adminLogin, requireAdmin } from './auth';
import clubRoutes from './routes/club.routes';
import ocrRoutes from './routes/ocr.routes';
import memberRoutes from './routes/member.routes';
import scheduleRoutes from './routes/schedule.routes';
import golfCourseRoutes from './routes/golfcourse.routes';
import roundRoutes from './routes/round.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '12mb' })); // scorecard photos arrive as base64

// Auth: a single club admin account (see src/auth.ts). Members never log in.
app.post('/api/auth/login', adminLogin);

// Every write under /api (except the login itself) requires the admin token.
app.use('/api', requireAdmin);

// Routes
app.use('/api/club', clubRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/courses', golfCourseRoutes);
app.use('/api/rounds', roundRoutes);

app.get('/', (req, res) => {
    res.send('The Golf App Backend is running!');
});

// The app is exported for two runtimes:
// - local/self-hosted: src/server.ts calls listen()
// - Vercel serverless: api/index.ts re-exports this app as the handler
export default app;
