const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    streetName: {
        type: String,
        required: true
    },
    complainantName: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Not Closed', 'Closed'],
        default: 'Not Closed'
    },
    corpExplanation: {
        type: String,
        default: ''
    },
    corpImageUrl: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
