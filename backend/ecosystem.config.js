// pm2 process file — run from the backend folder:
//   npm run build && pm2 start ecosystem.config.js && pm2 save
module.exports = {
    apps: [
        {
            name: 'thegolfapp',
            cwd: __dirname,
            script: 'dist/server.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
                // DATABASE_URL, PORT, ADMIN_*, GEMINI_API_KEY are read from
                // backend/.env by the app itself — keep secrets there,
                // not in this file.
            },
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
        },
    ],
};
