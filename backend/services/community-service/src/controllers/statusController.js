const Status = require('../models/Status');
const UserProfile = require('../models/UserProfile');
const { uploadToCloudinary } = require('../utils/cloudinaryConfig');

exports.createStatus = async (req, res) => {
    try {
        const { authorId, content } = req.body;

        // Upload file buffer to Cloudinary, or fallback to body URL
        let mediaUrl = '';
        if (req.file && req.file.buffer) {
            const result = await uploadToCloudinary(req.file.buffer);
            mediaUrl = result.secure_url;
        } else if (req.body.mediaUrl) {
            mediaUrl = req.body.mediaUrl;
        }

        const status = new Status({
            authorId,
            content: content || '',
            mediaUrl
        });

        await status.save();
        res.status(201).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error creating status', error: error.message });
    }
};

exports.getStatuses = async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await UserProfile.findOne({ userId });
        if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Get statuses from followed users + own statuses
        const userIds = [...profile.following, userId];

        // Since we have a TTL index on Status, expired items should automatically be deleted.
        // We can add a fallback filter just in case TTL cleanup hasn't run yet.
        const activeStatuses = await Status.find({
            authorId: { $in: userIds },
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        res.json(activeStatuses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statuses', error: error.message });
    }
};

exports.deleteStatus = async (req, res) => {
    try {
        const { statusId } = req.params;
        const { authorId } = req.body;

        const status = await Status.findById(statusId);

        if (!status) {
            return res.status(404).json({ message: 'Status not found' });
        }

        if (status.authorId !== authorId) {
            return res.status(403).json({ message: 'Unauthorized to delete this status' });
        }

        await Status.findByIdAndDelete(statusId);
        res.json({ message: 'Status deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting status', error: error.message });
    }
};
