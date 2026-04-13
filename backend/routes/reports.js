const express = require('express');
const router = express.Router();
const { createReport, getMyReports, getStats } = require('../controllers/reportController');

router.post('/', createReport);
router.get('/', getMyReports);
router.get('/stats', getStats);

module.exports = router;
