module.exports = {
  apps: [{
    name: 'chillenge-russia',
    script: 'node_modules/.bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '256M',
    instances: 1,
    autorestart: true,
    watch: false
  }]
};
