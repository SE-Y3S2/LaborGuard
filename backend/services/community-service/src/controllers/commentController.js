const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { emitEvent } = require('../utils/kafkaProducer');

exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { authorId, content } = req.body;

        // Ensure post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = new Comment({
            postId,
            authorId,
            content
        });

        await comment.save();

        // Emit comment event, but only if they are not the author
        if (post.authorId !== authorId) {
            emitEvent('community-events', 'post_commented', {
                commenterId: authorId,
                authorId: post.authorId,
                postId: post._id,
                commentId: comment._id
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const comments = await Comment.find({ postId })
            .sort({ createdAt: 1 }) // oldest first typically for comments
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { authorId } = req.body;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.authorId !== authorId) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(commentId);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

exports.reportComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const Report = require('../models/Report');
        const { reporterId, reason } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.isReported = true;
        comment.reportCount += 1;
        await comment.save();

        const report = new Report({
            reporterId,
            targetType: 'Comment',
            targetId: commentId,
            reason
        });
        await report.save();

        res.json({ message: 'Comment reported successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error reporting comment', error: error.message });
    }
};
