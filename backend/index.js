const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/road_damage_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connection established successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));

// Simple sanity check route
app.get('/api/status', (req, res) => {
  res.json({ status: 'Road Damage AI backend is online' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server is running on port: ${PORT}`);
});
