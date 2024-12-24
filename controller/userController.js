const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const redis = require('../config/redisClient');
const User = require('../models/userModels');
const Volunteer = require('../models/volunteerModels')
const Problem = require("../models/problemModels");
const Donation = require("../models/donationSchema");
const mongoose = require("mongoose");
const Joi = require('joi');
//register
const register = async (req, res) => {
    // Input validation
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        // Generate JWT token without expiry
        const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET);

        // Save token in Redis without expiry
        await redis.set(savedUser._id.toString(), token);

        // Send response
        res.status(201).json({ token, message: 'Registration successful' });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
};
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
            { userId: isUser._id}, process.env.JWT_SECRET
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
        const userId = req.user;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Remove the token from Redis
        const result = await redis.del(userId);

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


//Join problem
const joinProblem = async (req, res) => {
    const { id } = req.params;
    const userId = req.user;

    // Validate required parameters
    if (!id || !userId) {
        return res.status(400).json({ message: "Problem ID and User ID are required." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if the user is already a volunteer for this problem
        const existingVolunteer = await Volunteer.findOne({ userId, problem: id }).session(session);
        if (existingVolunteer) {
            return res.status(409).json({ message: "User has already joined this problem." });
        }

        const problem = await Problem.findById(id).session(session);
        const user = await User.findById(userId).session(session);

        // Check if the problem exists
        if (!problem) {
            return res.status(404).json({ message: "Problem not found." }); // Use 404 for "not found"
        }

        // Check if adding a new volunteer exceeds the limit
        if (problem.volunteerReceived.length >= problem.volunteerNeeded) {
            return res.status(400).json({ message: "Volunteer limit reached for this problem." });
        }

        // Add the user as a volunteer
        problem.volunteerReceived += 1;
        problem.volunteerUser.push(userId);
        user.totalVolunteer += 1;

        // Save the user and problem with the session
        await user.save({ session });
        await problem.save({ session });

        // Create a new volunteer record
        const newVolunteer = new Volunteer({
            user: userId,
            problem: id,
        });

        const savedVolunteer = await newVolunteer.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Respond with a success message
        return res.status(201).json({ message: "Successfully joined the problem as a volunteer.", volunteer: savedVolunteer });

    } catch (error) {
        console.error("Error joining problem:", error);

        // Rollback the transaction if something goes wrong
        await session.abortTransaction();
        session.endSession();

        // Ensure no duplicate responses
        if (!res.headersSent) {
            return res.status(500).json({ message: "Internal server error.", error: error.message });
        }
    }
};


const donate = async (req, res) => {
    const { amount } = req.body; // Note: correct spelling if necessary
    const { id } = req.params;
    const userId = req.user;

    console.log('amount:', req.body);

    // Validate required parameters
    if (!id || !userId) {
        return res.status(400).json({ message: "Problem ID and User ID are required." });
    }

    try {

        const problem = await Problem.findById(id);
        const user = await  User.findById(userId);



        // Check if the problem exists
        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        // Create a new donation record
        const newDonation = new Donation({
            user: userId,
            problem: id,
            donationAmount: amount, // Assuming `amount` is part of the Donation model
        });
        const savedDonation = await newDonation.save();


        problem.donationReceived += amount;
        user.totalDonation += amount;
        problem.donationUser.push(savedDonation._id);
        await user.save();
        await problem.save(); // Save the updated problem document

        // Fetch the updated problem with populated donation details
        const updatedProblem = await Problem.findById(id)
            .populate({
                path: 'donationUser', // Populate the donationReceived field
                populate: { path: 'user', select: 'name' }, // Populate user details from Donation
            });

        // Respond with the updated problem
        return res.status(201).json(updatedProblem);
    } catch (error) {
        console.error("Error donating to problem:", error);

        // Ensure no duplicate responses
        if (!res.headersSent) {
            return res.status(500).json({ message: "Internal server error.", error: error.message });
        }
    }
};




module.exports = { register, login, logout, joinProblem, donate };

