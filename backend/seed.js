const User = require('./models/User');
const bcrypt = require('bcrypt');

const seedUsers = async () => {
    try {
        // 1. Ensure corporation user exists
        const corpExists = await User.findOne({ username: 'corporation' });
        if (!corpExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('7777', salt);
            const corp = new User({
                username: 'corporation',
                email: 'corp@city.gov',
                password: hashedPassword,
                role: 'corporation'
            });
            await corp.save();
            console.log('Seeded corporation user');
        }
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

module.exports = seedUsers;
