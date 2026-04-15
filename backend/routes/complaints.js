const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

// All routes require auth
router.post('/', complaintController.createComplaint);
router.get('/my', complaintController.getMyComplaints);
router.get('/all', complaintController.getAllComplaints);
router.put('/:id/resolve', complaintController.resolveComplaint);

module.exports = router;
