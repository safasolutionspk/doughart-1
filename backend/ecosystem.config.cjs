/**
 * PM2 ecosystem — DoughArt API (production).
 *
 * Usage (from backend/):
 *   npm run build
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 save
 *
 * Requires backend/.env on the server (never commit).
 */
const path = require("path");

module.exports = {
  apps: [
    {
      name: "sweetbite-backend",
      script: path.join(__dirname, "dist", "index.js"),
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 3000,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: path.join(__dirname, "logs", "pm2-error.log"),
      out_file: path.join(__dirname, "logs", "pm2-out.log"),
      merge_logs: true,
      time: true,
    },
  ],
};
