import express from 'express';
import cors from 'cors';
import { adminLogin, requireAdmin } from './auth';
import clubRoutes from './routes/club.routes';
import memberRoutes from './routes/member.routes';
import scheduleRoutes from './routes/schedule.routes';
import golfCourseRoutes from './routes/golfcourse.routes';
import roundRoutes from './routes/round.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Auth: a single club admin account (see src/auth.ts). Members never log in.
app.post('/api/auth/login', adminLogin);

// Every write under /api (except the login itself) requires the admin token.
app.use('/api', requireAdmin);

// Routes
app.use('/api/club', clubRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/courses', golfCourseRoutes);
app.use('/api/rounds', roundRoutes);

app.get('/', (req, res) => {
    res.send('The Golf App Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
