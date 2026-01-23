import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.warn('REDIS_URL is not defined in the environment variables.');
    if (process.env.NODE_ENV === 'production') {
        throw new Error('REDIS_URL is required in production');
    }
}

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Ensure connection is established before usage where possible, 
// but for now, we start it globally.
(async () => {
    if (!redisClient.isOpen) {
        try {
            await redisClient.connect();
            console.log('Redis connected successfully');
        } catch (err) {
            console.error('Failed to connect to Redis', err);
        }
    }
})();

export default redisClient;
