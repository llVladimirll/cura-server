const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Name is required'], // Custom error message
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    imageUrl: {
        type: String,
    },
    description: {
        type: String,
        required: [true, 'Password is required'], // Custom error message
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    location : {
        type: String,
        required: [true, 'Location is required'], // Custom error message
        minlength: [3, 'Location must be at least 3 characters long'],
        maxlength: [50, 'Location cannot exceed 50 characters'],
    },
    donationNeeded: {
        type: Number,
        default: 0,
    },
    volunteerNeeded: {
        type: Number,
        default: 0,
    },
    donationReceived: {
        type: Number,
        default: 0,
    },
    volunteerReceived: {
        type: Number,
        default: 0,
    },
    volunteerUser:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },],
    donationUser:[{
       type : mongoose.Schema.Types.ObjectId,
        ref : 'Donation'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

// Create a model based on the schema
const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
