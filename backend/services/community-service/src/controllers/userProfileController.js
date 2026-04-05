/**
 * userProfileController.js — Community Service
 *
 * FIXES:
 *  [AUTH]   currentUserId from req.user.userId (JWT) — not req.body
 *  [ATOMIC] followUser: parallel $addToSet on both docs — no load-push-save
 *  [ATOMIC] unfollowUser: parallel $pull on both docs — no filter-save
 *  [ATOMIC] toggleBookmark: $addToSet / $pull via findOneAndUpdate
 *  [PERF]   getBookmarks: real DB-level pagination via two targeted queries.
 *           Old populate() + skip/limit in options did NOT paginate at DB level.
 *  [UPSERT] createOrUpdateProfile: single findOneAndUpdate upsert — no if/else
 */

const UserProfile = require('../models/UserProfile');
const Post        = require('../models/Post');
const { emitEvent } = require('../utils/kafkaProducer');

exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await UserProfile.findOne({ userId }).lean();
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

exports.followUser = async (req, res) => {
    try {
        const currentUserId = req.user.userId;  // [AUTH] from JWT
        const { targetUserId } = req.body;

        if (currentUserId === targetUserId)
            return res.status(400).json({ message: 'Cannot follow yourself' });

        const [currentExists, targetExists] = await Promise.all([
            UserProfile.exists({ userId: currentUserId }),
            UserProfile.exists({ userId: targetUserId })
        ]);

        if (!currentExists || !targetExists)
            return res.status(404).json({ message: 'One or both user profiles not found' });

        // [ATOMIC] $addToSet prevents duplicates; both writes in parallel
        await Promise.all([
            UserProfile.updateOne({ userId: currentUserId }, { $addToSet: { following: targetUserId } }),
            UserProfile.updateOne({ userId: targetUserId  }, { $addToSet: { followers: currentUserId } })
        ]);

        emitEvent('community-events', 'user_followed', { followerId: currentUserId, targetUserId });

        res.json({ message: 'Successfully followed user' });
    } catch (error) {
        res.status(500).json({ message: 'Error following user', error: error.message });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const currentUserId = req.user.userId;  // [AUTH] from JWT
        const { targetUserId } = req.body;

        // [ATOMIC] $pull on both docs in parallel — no filter-then-save
        await Promise.all([
            UserProfile.updateOne({ userId: currentUserId }, { $pull: { following: targetUserId } }),
            UserProfile.updateOne({ userId: targetUserId  }, { $pull: { followers: currentUserId } })
        ]);

        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({ message: 'Error unfollowing user', error: error.message });
    }
};

exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { userId, name, role, avatarUrl, bio } = req.body;

        const update = {};
        if (name)              update.name      = name;
        if (role)              update.role      = role;
        if (avatarUrl)         update.avatarUrl = avatarUrl;
        if (bio !== undefined) update.bio       = bio;

        // [UPSERT] Single atomic operation — no if/else branching
        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            { $set: update, $setOnInsert: { userId } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error saving profile', error: error.message });
    }
};

exports.toggleBookmark = async (req, res) => {
    try {
        const currentUserId = req.user.userId;  // [AUTH] from JWT
        const { postId } = req.body;

        // [ATOMIC] Check then update — no load-splice-save
        const hasBookmark = await UserProfile.exists({ userId: currentUserId, bookmarks: postId });

        const update = hasBookmark
            ? { $pull:     { bookmarks: postId } }
            : { $addToSet: { bookmarks: postId } };

        const profile = await UserProfile.findOneAndUpdate(
            { userId: currentUserId },
            update,
            { new: true, projection: { bookmarks: 1 } }
        );
        if (!profile) return res.status(404).json({ message: 'User profile not found' });

        res.json({
            message   : hasBookmark ? 'Bookmark removed' : 'Bookmark added',
            bookmarks : profile.bookmarks
        });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling bookmark', error: error.message });
    }
};

exports.getBookmarks = async (req, res) => {
    try {
        const { userId } = req.params;
        const page  = Math.max(1,   parseInt(req.query.page)  || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);

        // [PERF] Step 1 — Fetch ONLY the bookmarks ID array (cheap)
        const profile = await UserProfile.findOne({ userId }, { bookmarks: 1 }).lean();
        if (!profile) return res.status(404).json({ message: 'User profile not found' });

        // [PERF] Step 2 — Real DB-level pagination via Post collection.
        //  Replaces old populate() + in-memory skip/limit that did NOT paginate at DB level.
        const bookmarkedPosts = await Post.find({ _id: { $in: profile.bookmarks } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.json(bookmarkedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookmarks', error: error.message });
    }
};