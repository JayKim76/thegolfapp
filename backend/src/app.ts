import express from 'express';
import cors from 'cors';
import memberRoutes from './routes/member.routes';
import scheduleRoutes from './routes/schedule.routes';
import golfCourseRoutes from './routes/golfcourse.routes';
import roundRoutes from './routes/round.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
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
