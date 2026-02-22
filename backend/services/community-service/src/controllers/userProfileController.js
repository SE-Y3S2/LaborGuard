const UserProfile = require('../models/UserProfile');
const { emitEvent } = require('../utils/kafkaProducer');

exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await UserProfile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

exports.followUser = async (req, res) => {
    try {
        const { currentUserId, targetUserId } = req.body;

        if (currentUserId === targetUserId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const currentUser = await UserProfile.findOne({ userId: currentUserId });
        const targetUser = await UserProfile.findOne({ userId: targetUserId });

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        if (!currentUser.following.includes(targetUserId)) {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);

            await currentUser.save();
            await targetUser.save();

            // Emit follow event
            emitEvent('community-events', 'user_followed', {
                followerId: currentUserId,
                targetUserId: targetUserId
            });
        }

        res.json({ message: 'Successfully followed user' });
    } catch (error) {
        res.status(500).json({ message: 'Error following user', error: error.message });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const { currentUserId, targetUserId } = req.body;

        const currentUser = await UserProfile.findOne({ userId: currentUserId });
        const targetUser = await UserProfile.findOne({ userId: targetUserId });

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        currentUser.following = currentUser.following.filter(id => id !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);

        await currentUser.save();
        await targetUser.save();

        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({ message: 'Error unfollowing user', error: error.message });
    }
};

exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { userId, name, role, avatarUrl, bio } = req.body;

        let profile = await UserProfile.findOne({ userId });

        if (profile) {
            // Update
            if (name) profile.name = name;
            if (role) profile.role = role;
            if (avatarUrl) profile.avatarUrl = avatarUrl;
            if (bio) profile.bio = bio;
        } else {
            // Create
            profile = new UserProfile({ userId, name, role, avatarUrl, bio });
        }

        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error saving profile', error: error.message });
    }
};

exports.toggleBookmark = async (req, res) => {
    try {
        const { currentUserId, postId } = req.body;

        const profile = await UserProfile.findOne({ userId: currentUserId });
        if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        const index = profile.bookmarks.indexOf(postId);
        if (index > -1) {
            // Remove bookmark
            profile.bookmarks.splice(index, 1);
        } else {
            // Add bookmark
            profile.bookmarks.push(postId);
        }

        await profile.save();
        res.json({ message: 'Bookmark toggled', bookmarks: profile.bookmarks });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling bookmark', error: error.message });
    }
};

exports.getBookmarks = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const profile = await UserProfile.findOne({ userId }).populate({
            path: 'bookmarks',
            options: {
                sort: { createdAt: -1 },
                skip: (page - 1) * limit,
                limit: limit
            }
        });

        if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        res.json(profile.bookmarks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookmarks', error: error.message });
    }
};
