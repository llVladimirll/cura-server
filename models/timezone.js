const User = require('./userModels'); // Import your model
const moment = require('moment-timezone');

async function updateCreatedAtToTimezone() {
    try {
        const users = await User.find({});
        for (const user of users) {
            const updatedCreatedAt = moment(user.createdAt).tz('Asia/Jakarta').toDate();
            await User.updateOne({ _id: user._id }, { createdAt: updatedCreatedAt });
        }
        console.log('All user timestamps updated to Asia/Jakarta timezone');
    } catch (error) {
        console.error('Error updating timestamps:', error);
    }
}

updateCreatedAtToTimezone();
