const Report = require('../models/Report');
const Complaint = require('../models/Complaint');
const jwt = require('jsonwebtoken');

// Middleware-style helper to extract user from JWT
const getUserFromToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        return decoded.user.id;
    } catch {
        return null;
    }
};

// POST /api/reports — save a new report after ML analysis
exports.createReport = async (req, res) => {
    try {
        const userId = getUserFromToken(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { damage_type, confidence, severity, location, latitude, longitude } = req.body;

        const report = new Report({
            user: userId,
            damage_type,
            confidence,
            severity,
            location: location || 'Unknown Location',
            latitude: latitude || null,
            longitude: longitude || null,
        });

        await report.save();
        res.status(201).json({ message: 'Report saved successfully', report });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while saving report' });
    }
};

// GET /api/reports — get all reports for the logged-in user
exports.getMyReports = async (req, res) => {
    try {
        const userId = getUserFromToken(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const reports = await Report.find({ user: userId }).sort({ createdAt: -1 });
        res.json(reports);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching reports' });
    }
};

// GET /api/reports/stats — aggregated counts for Dashboard + Analytics
exports.getStats = async (req, res) => {
    try {
        const userId = getUserFromToken(req);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const [total, high, resolved] = await Promise.all([
            Report.countDocuments({ user: userId }),
            Report.countDocuments({ user: userId, severity: 'High' }),
            Complaint.countDocuments({ status: 'Closed' }),
        ]);

        // Breakdown by damage type for Pie Chart
        const breakdown = await Report.aggregate([
            { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
            { $group: { _id: '$damage_type', value: { $sum: 1 } } },
            { $project: { name: '$_id', value: 1, _id: 0 } }
        ]);

        // Monthly trend for the past 7 months for Area Chart
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const now = new Date();
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const count = await Report.countDocuments({ user: userId, createdAt: { $gte: start, $lt: end } });
            trend.push({ name: months[d.getMonth()], reports: count });
        }

        res.json({ total, high, resolved, breakdown, trend });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching stats' });
    }
};
