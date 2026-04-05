/**
 * commentController.js — Community Service
 *
 * FIXES:
 *  [AUTH]   authorId / reporterId from req.user.userId (JWT) — not req.body
 *  [ATOMIC] reportComment: findByIdAndUpdate + $inc — no load-then-save
 *  [PERF]   getComments: .lean() on read-only query
 */

const Comment = require('../models/Comment');
const Post    = require('../models/Post');
const { emitEvent } = require('../utils/kafkaProducer');

exports.addComment = async (req, res) => {
    try {
        const authorId = req.user.userId;   // [AUTH] from JWT
        const { postId } = req.params;
        const { content } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = new Comment({ postId, authorId, content });
        await comment.save();

        if (post.authorId !== authorId) {
            emitEvent('community-events', 'post_commented', {
                commenterId : authorId,
                authorId    : post.authorId,
                postId      : post._id,
                commentId   : comment._id
            });
        }

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page  = Math.max(1,   parseInt(req.query.page)  || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);

        const comments = await Comment.find({ postId })
            .sort({ createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();   // [PERF] plain JS object

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const authorId = req.user.userId;   // [AUTH] from JWT
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.authorId !== authorId)
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });

        await Comment.findByIdAndDelete(commentId);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

exports.reportComment = async (req, res) => {
    try {
        const reporterId = req.user.userId; // [AUTH] from JWT
        const { commentId } = req.params;
        const Report = require('../models/Report');
        const { reason } = req.body;

        // [ATOMIC] Update flags in one operation — no load-then-save
        const comment = await Comment.findByIdAndUpdate(
            commentId,
            { isReported: true, $inc: { reportCount: 1 } },
            { new: true }
        );
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const report = new Report({ reporterId, targetType: 'Comment', targetId: commentId, reason });
        await report.save();

        res.json({ message: 'Comment reported successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error reporting comment', error: error.message });
    }
};