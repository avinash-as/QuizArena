module.exports = {
  apps: [
    {
      name: 'QuizPitara-api',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: { NODE_ENV: 'development' },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      max_memory_restart: '500M',
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
