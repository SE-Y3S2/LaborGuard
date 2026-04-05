const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Create a new Job Posting
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = async (req, res, next) => {
    try {
        const jobData = {
            ...req.body,
            employerId: req.user.userId,
            imageUrl: req.body.imageUrl || undefined // Use default if empty
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

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private/Worker
const applyToJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if already applied
        const existingApp = await Application.findOne({
            jobId: req.params.id,
            workerId: req.user.userId
        });

        if (existingApp) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }

        const application = await Application.create({
            jobId: req.params.id,
            workerId: req.user.userId,
            workerName: req.user.email.split('@')[0], // Fallback name
            workerEmail: req.user.email,
            workerExperience: req.body.workerExperience,
            additionalDetails: req.body.additionalDetails || ''
        });

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get worker's applications
// @route   GET /api/jobs/my-applications
// @access  Private/Worker
const getWorkerApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ workerId: req.user.userId })
            .populate('jobId')
            .sort({ appliedDate: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update application status
// @route   PUT /api/jobs/applications/:appId/status
// @access  Private/Employer or Admin
const updateApplicationStatus = async (req, res, next) => {
    try {
        const application = await Application.findByIdAndUpdate(
            req.params.appId,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all applications for a specific job
// @route   GET /api/jobs/:id/applications
// @access  Private/Employer or Admin
const getJobApplications = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Only owner or admin
        if (job.employerId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const applications = await Application.find({ jobId: req.params.id }).sort({ appliedDate: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        next(error);
    }
};


// FIX: NEW — Employers fetch their own job postings
// @route   GET /api/jobs/my-listings
// @access  Private (employer, admin)
const getEmployerJobs = async (req, res, next) => {
    try {
        const employerId = req.user.userId; // from JWT — never req.body
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;

        const Job = require('../models/Job');
        const total = await Job.countDocuments({ postedBy: employerId });
        const jobs  = await Job.find({ postedBy: employerId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            count: jobs.length,
            total,
            data: jobs
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getEmployerJobs,
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    applyToJob,
    getWorkerApplications,
    updateApplicationStatus,
    getJobApplications
};