const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    user: {
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
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
    },

}, { timestamps: true });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
