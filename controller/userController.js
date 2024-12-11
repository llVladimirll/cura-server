const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const redis = require('../redisClient');
const User = require('../models/userModels');

//register
const register = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({email});
        if (existingUser){
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET);

        await redis.set(savedUser._id.toString(), token);

        res.status(201).json({ token });
    }catch (err){
        res.status(500).json({ message: err.message });
    }
}

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Use findOne
        const isUser = await User.findOne({ email });
        if (!isUser) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, isUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a token
        const token = jwt.sign(
            { id: isUser._id, email: isUser.email }, process.env.JWT_SECRET
        );

        await redis.set(isUser._id.toString(), token);

        // Respond with user details and token
        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        // Handle server errors
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        // Ensure the userId is available in the request
        const userId = req.user; // Assuming verifyToken middleware attaches userId to req.user

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Remove the token from Redis
        const result = await redis.del(userId.toString());

        if (result === 1) {
            return res.status(200).json({ message: 'Logout successful' });
        } else {
            return res.status(400).json({ message: 'Session not found or already expired' });
        }
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'Internal server error during logout' });
    }
};

module.exports = { register, login, logout };

