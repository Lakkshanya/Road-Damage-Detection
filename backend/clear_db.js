const mongoose = require('mongoose');
require('dotenv').config();

const clearDB = async () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/road_damage_db';
    try {
        console.log(`Connecting to ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');
        
        console.log('Dropping database...');
        await mongoose.connection.db.dropDatabase();
        console.log('Database dropped successfully!');
        
        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
};

clearDB();
