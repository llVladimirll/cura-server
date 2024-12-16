const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    },
    donationAmount: {
        type: Number,
        required: [true, 'Donation amount is required'],
    },
    date: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
