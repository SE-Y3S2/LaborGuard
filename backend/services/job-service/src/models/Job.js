const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    employerId: {
        type: mongoose.Schema.Types.ObjectId, // Will ref User from auth-service
        required: [true, 'Employer ID is required']
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    wage: {
        amount: {
            type: Number,
            required: [true, 'Wage amount is required'],
            min: [0, 'Wage must be a positive number']
        },
        currency: {
            type: String,
            default: 'USD', // Adjust to local currency if needed
        },
        frequency: {
            type: String,
            enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'per-task'],
            required: [true, 'Wage payment frequency is required']
        }
    },
    compliesWithMinimumWage: {
        type: Boolean,
        default: false,
        required: true
    },
    location: {
        address: { type: String, required: [true, 'Address is required'] },
        city: { type: String, required: [true, 'City is required'] },
        state: { type: String },
        country: { type: String, default: 'USA' }, // Default adjust as needed
    },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'temporary', 'freelance'],
        required: [true, 'Job type is required']
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'filled', 'pending_review'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Optionally, you could add pre-save hooks to automatically check wage against a minimum wage registry if you build that later.

module.exports = mongoose.model('Job', JobSchema);
