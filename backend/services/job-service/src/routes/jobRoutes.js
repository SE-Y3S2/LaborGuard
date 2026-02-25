const express = require('express');
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
} = require('../controllers/jobController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(getJobs) // Public route to view jobs
    .post(protect, authorize('employer', 'admin'), createJob); // Only employers and admins can post

router
    .route('/:id')
    .get(getJobById)
    .put(protect, authorize('employer', 'admin'), updateJob)
    .delete(protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;
