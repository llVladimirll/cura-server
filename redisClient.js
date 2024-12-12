const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

redis.on('connect', () => {
    console.log('Connected to Redis!');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});
