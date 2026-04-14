const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const seedUsers = require('./seed');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Connect to MongoDB
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/road_damage_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connection established successfully');
    await seedUsers();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/complaints', require('./routes/complaints'));

// Simple sanity check route
app.get('/api/status', (req, res) => {
  res.json({ status: 'Road Damage AI backend is online' });
});

// Global Error Handler for JSON formatting
app.use((err, req, res, next) => {
  console.error('[EXPRESS ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server is running on port: ${PORT}`);
});
