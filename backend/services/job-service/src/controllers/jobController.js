const Job = require('../models/Job');

// @desc    Create a new Job Posting
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = async (req, res, next) => {
    try {
        // Automatically assign the user ID from the token as the employer ID
        const jobData = {
            ...req.body,
            employerId: req.user.userId
        };

        const job = await Job.create(jobData);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all jobs (with optional filtering)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
    try {
        const query = {};

        // Optional filters
        if (req.query.status) query.status = req.query.status;
        if (req.query.employerId) query.employerId = req.query.employerId;
        if (req.query.jobType) query.jobType = req.query.jobType;

        const jobs = await Job.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Employer (Owner) or Admin
const updateJob = async (req, res, next) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Ensure user is the employer who posted it OR an admin
        if (job.employerId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'User not authorized to update this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Employer (Owner) or Admin
const deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Ensure user is the employer who posted it OR an admin
        if (job.employerId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'User not authorized to delete this job' });
        }

        await job.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Job removed'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
};
