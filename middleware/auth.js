const jwt = require('jsonwebtoken');
const redis = require('../config/redisClient');
const { config } = require('dotenv');

config();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
    console.log('token:', token);
    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('decoded:', decoded.id);

        const userId = decoded.id;
        const cachedToken = await redis.get(userId);
        console.log('cachedToken:', cachedToken);

        if (!cachedToken || cachedToken !== token) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }


        req.user = userId;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { verifyToken };