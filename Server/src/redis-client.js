const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = createClient({ url: redisUrl });

redis.on('error', (err) => console.error('Redis Client Error', err));

async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

module.exports = { redis, connectRedis };
