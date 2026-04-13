const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    damage_type: { type: String, required: true }, // e.g. "Pothole", "Crack", "Manhole"
    confidence: { type: String, required: true },  // e.g. "94.20%"
    severity: { type: String, required: true },    // "High", "Medium", "Low"
    location: { type: String, default: 'Unknown Location' },
    status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Resolved'] },
    image_url: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
