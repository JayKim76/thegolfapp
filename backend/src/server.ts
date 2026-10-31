import app from './app';

// Local / self-hosted entry point (npm start, pm2, systemd).
// On Vercel this file is not used — api/index.ts serves the app instead.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
