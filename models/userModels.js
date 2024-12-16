const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'], // Custom error message
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'], // Custom error message
        unique: true, // Ensure email is unique
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'], // Custom error message
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    date: {
        type: Date,
        default: Date.now, // Timestamp when the user is created
    },
    totalDonation: {
        type: Number,
        default: 0,
    },
    totalVolunteer: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
