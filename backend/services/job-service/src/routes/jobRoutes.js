const express = require('express');
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    applyToJob,
    getWorkerApplications,
    updateApplicationStatus
} = require('../controllers/jobController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(getJobs) // Public route to view jobs
    .post(protect, authorize('employer', 'admin'), createJob); // Only employers and admins can post

router.get('/my-applications', protect, getWorkerApplications); // Workers view their own apps

router
    .route('/:id')
    .get(getJobById)
    .put(protect, authorize('employer', 'admin'), updateJob)
    .delete(protect, authorize('employer', 'admin'), deleteJob);

router.post('/:id/apply', protect, authorize('worker'), applyToJob); // Only workers can apply
router.put('/applications/:appId/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;
