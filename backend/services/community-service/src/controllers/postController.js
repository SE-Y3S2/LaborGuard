/**
 * postController.js — Community Service
 *
 * FIXES:
 *  [AUTH]   authorId from req.user.userId (JWT) — never req.body
 *  [PERF]   getFeed: $or server-side query — no [...following, userId] array spread
 *  [ATOMIC] likePost: $addToSet / $pull — no splice/indexOf
 *  [ATOMIC] sharePost: $inc — no load-then-save
 *  [ATOMIC] reportPost: $set + $inc
 *  [PERF]   .lean() on all read-only queries
 */

const Post        = require('../models/Post');
const UserProfile = require('../models/UserProfile');
const { emitEvent }          = require('../utils/kafkaProducer');
const { uploadToCloudinary } = require('../utils/cloudinaryConfig');

const parseArrayField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try { return JSON.parse(value); } catch { return [value]; }
};

const parseJsonField = (value) => {
    if (!value) return undefined;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch { return undefined; }
};

// ── Create Post ───────────────────────────────────────────────────────────────

exports.createPost = async (req, res) => {
    try {
        const authorId = req.user.userId;   // [AUTH] from JWT
        const { content, hashtags, poll } = req.body;

        let mediaUrls = [];
        if (req.files && req.files.length > 0) {
            const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer)));
            mediaUrls = results.map(r => r.secure_url);
        } else if (req.body.mediaUrls) {
            mediaUrls = parseArrayField(req.body.mediaUrls);
        }

        const post = new Post({
            authorId,
            content,
            mediaUrls,
            hashtags : parseArrayField(hashtags),
            poll     : parseJsonField(poll)
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

// ── Get Feed ──────────────────────────────────────────────────────────────────

exports.getFeed = async (req, res) => {
    try {
        const { userId } = req.params;
        const page  = Math.max(1,   parseInt(req.query.page)  || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);

        // Lightweight: fetch ONLY the following array
        const profile = await UserProfile.findOne({ userId }, { following: 1 }).lean();
        if (!profile) return res.status(404).json({ message: 'User profile not found' });

        // [PERF] $or resolved entirely on MongoDB — zero JS array allocation
        const posts = await Post.find({
            $or: [
                { authorId: { $in: profile.following } },
                { authorId: userId }
            ]
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feed', error: error.message });
    }
};

// ── Trending Feed ─────────────────────────────────────────────────────────────

exports.getTrendingFeed = async (req, res) => {
    try {
        const page  = Math.max(1,   parseInt(req.query.page)  || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);

        const posts = await Post.aggregate([
            { $addFields: { engagementScore: { $add: [{ $size: '$likes' }, '$shareCount'] } } },
            { $sort: { engagementScore: -1, createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending feed', error: error.message });
    }
};

// ── Search by Hashtag ─────────────────────────────────────────────────────────

exports.searchByHashtag = async (req, res) => {
    try {
        const { tag } = req.params;
        const page  = Math.max(1,   parseInt(req.query.page)  || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);

        const posts = await Post.find({ hashtags: tag })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error searching by hashtag', error: error.message });
    }
};

// ── Get Post by ID ────────────────────────────────────────────────────────────

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).lean();
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

// ── Update Post ───────────────────────────────────────────────────────────────

exports.updatePost = async (req, res) => {
    try {
        const authorId = req.user.userId;   // [AUTH] from JWT
        const { postId } = req.params;
        const { content } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.authorId !== authorId)
            return res.status(403).json({ message: 'Unauthorized to edit this post' });

        if (content) post.content = content;

        if (req.files && req.files.length > 0) {
            const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer)));
            post.mediaUrls = results.map(r => r.secure_url);
        } else if (req.body.mediaUrls) {
            post.mediaUrls = parseArrayField(req.body.mediaUrls);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

// ── Delete Post ───────────────────────────────────────────────────────────────

exports.deletePost = async (req, res) => {
    try {
        const authorId = req.user.userId;   // [AUTH] from JWT
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.authorId !== authorId)
            return res.status(403).json({ message: 'Unauthorized to delete this post' });

        await Post.findByIdAndDelete(postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};

// ── Like / Unlike Post ────────────────────────────────────────────────────────

exports.likePost = async (req, res) => {
    try {
        const userId  = req.user.userId;    // [AUTH] from JWT
        const { postId } = req.params;

        // [ATOMIC] Check current state without loading the full document
        const alreadyLiked = await Post.exists({ _id: postId, likes: userId });

        // [ATOMIC] $addToSet prevents duplicates; $pull removes cleanly
        const update = alreadyLiked
            ? { $pull:     { likes: userId } }
            : { $addToSet: { likes: userId } };

        const post = await Post.findByIdAndUpdate(postId, update, { new: true });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const action = alreadyLiked ? 'unliked' : 'liked';

        if (action === 'liked' && post.authorId !== userId) {
            emitEvent('community-events', 'post_liked', {
                likerId  : userId,
                authorId : post.authorId,
                postId   : post._id
            });
        }

        res.json({ action, post });
    } catch (error) {
        res.status(500).json({ message: 'Error liking post', error: error.message });
    }
};

// ── Share Post ────────────────────────────────────────────────────────────────

exports.sharePost = async (req, res) => {
    try {
        const { postId } = req.params;

        // [ATOMIC] $inc — no load-then-save race condition
        const post = await Post.findByIdAndUpdate(
            postId,
            { $inc: { shareCount: 1 } },
            { new: true }
        );

        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error sharing post', error: error.message });
    }
};

// ── Vote on Poll ──────────────────────────────────────────────────────────────

exports.votePoll = async (req, res) => {
    try {
        const userId = req.user.userId;     // [AUTH] from JWT
        const { postId } = req.params;
        const { optionIndex } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (!post.poll || !post.poll.options)
            return res.status(400).json({ message: 'Post does not contain a poll' });
        if (optionIndex < 0 || optionIndex >= post.poll.options.length)
            return res.status(400).json({ message: 'Invalid poll option index' });

        const hasVoted = post.poll.options.some(opt => opt.votes.includes(userId));
        if (hasVoted)
            return res.status(400).json({ message: 'User has already voted on this poll' });

        post.poll.options[optionIndex].votes.push(userId);
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error voting on poll', error: error.message });
    }
};

// ── Report Post ───────────────────────────────────────────────────────────────

exports.reportPost = async (req, res) => {
    try {
        const reporterId = req.user.userId; // [AUTH] from JWT
        const { postId } = req.params;
        const Report = require('../models/Report');
        const { reason } = req.body;

        // [ATOMIC] Update flags in one operation
        const post = await Post.findByIdAndUpdate(
            postId,
            { isReported: true, $inc: { reportCount: 1 } },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const report = new Report({ reporterId, targetType: 'Post', targetId: postId, reason });
        await report.save();

        res.json({ message: 'Post reported successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error reporting post', error: error.message });
    }
};