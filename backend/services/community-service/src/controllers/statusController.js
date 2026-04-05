/**
 * statusController.js — Community Service
 *
 * FIXES:
 *  [AUTH]   authorId from req.user.userId (JWT) — not req.body
 *  [PERF]   getStatuses: $or server-side query — no [...following, userId] spread
 *  [PERF]   .lean() on read-only query
 */

const Status      = require('../models/Status');
const UserProfile = require('../models/UserProfile');
const { uploadToCloudinary } = require('../utils/cloudinaryConfig');

exports.createStatus = async (req, res) => {
    try {
        const authorId = req.user.userId;   // [AUTH] from JWT
        const { content } = req.body;

        let mediaUrl = '';
        if (req.file && req.file.buffer) {
            const result = await uploadToCloudinary(req.file.buffer);
            mediaUrl = result.secure_url;
        } else if (req.body.mediaUrl) {
            mediaUrl = req.body.mediaUrl;
        }

        const status = new Status({ authorId, content: content || '', mediaUrl });
        await status.save();
        res.status(201).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error creating status', error: error.message });
    }
};

exports.getStatuses = async (req, res) => {
    try {
        const { userId } = req.params;

        // Lightweight: fetch ONLY the following array
        const profile = await UserProfile.findOne({ userId }, { following: 1 }).lean();
        if (!profile) return res.status(404).json({ message: 'User profile not found' });

        // [PERF] $or resolved entirely on MongoDB — no JS array spread
        const activeStatuses = await Status.find({
            $or: [
                { authorId: { $in: profile.following } },
                { authorId: userId }
            ],
            expiresAt: { $gt: new Date() }
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json(activeStatuses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statuses', error: error.message });
    }
};

exports.deleteStatus = async (req, res) => {
    try {
        const authorId = req.user.userId;   // [AUTH] from JWT
        const { statusId } = req.params;

        const status = await Status.findById(statusId);
        if (!status) return res.status(404).json({ message: 'Status not found' });
        if (status.authorId !== authorId)
            return res.status(403).json({ message: 'Unauthorized to delete this status' });

        await Status.findByIdAndDelete(statusId);
        res.json({ message: 'Status deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting status', error: error.message });
    }
};