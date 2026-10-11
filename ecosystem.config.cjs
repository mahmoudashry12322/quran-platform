module = module || {};
module.exports = {
  apps: [
    {
      name: 'quran-backend',
      script: './server/index.js',
      cwd: '/var/www/quran.mahmoudashry.site',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    }
  ]
};
