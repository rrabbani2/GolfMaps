/**
 * PM2 Ecosystem Configuration for GolfMaps
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup  # Follow instructions to enable auto-start on boot
 */

module.exports = {
  apps: [
    {
      name: 'golfmaps',
      script: 'npm',
      args: 'start',
      cwd: '/home/ec2-user/golfmaps', // Update this to your actual project path
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      // Auto-restart settings
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Memory limits
      max_memory_restart: '500M',
      // Watch mode (disable in production)
      watch: false,
      // Ignore watch patterns
      ignore_watch: ['node_modules', '.next', 'logs'],
    },
  ],
};

