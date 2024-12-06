const Redis = require('ioredis');

// Create a new Redis client instance
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost', // Default to localhost if no REDIS_HOST provided
    port: process.env.REDIS_PORT || 6379,       // Default to 6379 if no REDIS_PORT provided
    password: process.env.REDIS_PASSWORD || '', // Use your Redis password if required
});

module.exports = redis;
