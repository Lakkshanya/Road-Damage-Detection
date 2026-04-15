const Complaint = require('../models/Complaint');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getUserFromToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        return decoded;
    } catch {
        return null;
    }
};

exports.createComplaint = async (req, res) => {
    try {
        const auth = getUserFromToken(req);
        if (!auth) return res.status(401).json({ error: 'Unauthorized' });

        const { streetName, complainantName, details, imageUrl } = req.body;

        const complaint = new Complaint({
            user: auth.user.id,
            streetName,
            complainantName,
            details,
            imageUrl,
            status: 'Not Closed'
        });

        await complaint.save();
        res.status(201).json(complaint);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getMyComplaints = async (req, res) => {
    try {
        const auth = getUserFromToken(req);
        if (!auth) return res.status(401).json({ error: 'Unauthorized' });

        const complaints = await Complaint.find({ user: auth.user.id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const auth = getUserFromToken(req);
        if (!auth) return res.status(401).json({ error: 'Unauthorized' });

        // Admin and Corp can see all
        const complaints = await Complaint.find().populate('user', 'username').sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.resolveComplaint = async (req, res) => {
    try {
        const auth = getUserFromToken(req);
        if (!auth) return res.status(401).json({ error: 'Unauthorized' });

        const { id } = req.params;
        const { corpExplanation, corpImageUrl, action } = req.body;

        if (action === 'cancel') {
            // Optional: delete or mark as rejected
            // For now just keep as Not Closed
            return res.json({ message: 'Complaint remains open' });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

        complaint.status = 'Closed';
        complaint.corpExplanation = corpExplanation;
        complaint.corpImageUrl = corpImageUrl || '';
        complaint.resolvedAt = new Date();

        await complaint.save();
        res.json(complaint);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
