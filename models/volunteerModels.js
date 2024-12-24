const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const volunteerSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    problem : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
    },
    status : {
        type: String,
        enum: ['pending', 'accepted', 'rejected', "completed"],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
},{timestamp : true})

const Volunteer = mongoose.model('volunteer', volunteerSchema);

module.exports = Volunteer;
