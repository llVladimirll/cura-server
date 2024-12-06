const jwt = require('jsonwebtoken');
const redis = require('./redisClient');
const { config } = require('dotenv');

config();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token is cached in Redis
        const cachedToken = await redis.get(decoded.userId.toString());

        if (!cachedToken || cachedToken !== token) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Attach user to the request object
        req.user = decoded.userId;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { verifyToken };