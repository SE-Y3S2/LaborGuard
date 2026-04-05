const express = require('express');
const router  = express.Router();
const reportController         = require('../controllers/reportController');
const { protect, authorize }   = require('../middleware/authMiddleware');

// Any authenticated user can file a report
router.post('/', protect, reportController.createReport);

// Admin-only moderation routes
router.get('/',            protect, authorize('admin'), reportController.getReports);
router.patch('/:reportId', protect, authorize('admin'), reportController.updateReportStatus);

module.exports = router;