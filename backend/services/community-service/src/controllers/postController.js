const Post = require('../models/Post');
const UserProfile = require('../models/UserProfile');
const { emitEvent } = require('../utils/kafkaProducer');
const { uploadToCloudinary } = require('../utils/cloudinaryConfig');

exports.createPost = async (req, res) => {
    try {
        const { authorId, content, hashtags, poll } = req.body;


        let mediaUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
            const results = await Promise.all(uploadPromises);
            mediaUrls = results.map(r => r.secure_url);
        } else if (req.body.mediaUrls) {

            mediaUrls = Array.isArray(req.body.mediaUrls) ? req.body.mediaUrls : [req.body.mediaUrls];
        }


        let parsedHashtags = hashtags || [];
        if (typeof parsedHashtags === 'string') {
            try { parsedHashtags = JSON.parse(parsedHashtags); } catch (e) { parsedHashtags = [parsedHashtags]; }
        }


        let parsedPoll = poll || undefined;
        if (typeof parsedPoll === 'string') {
            try { parsedPoll = JSON.parse(parsedPoll); } catch (e) { parsedPoll = undefined; }
        }

        const post = new Post({
            authorId,
            content,
            mediaUrls,
            hashtags: parsedHashtags,
            poll: parsedPoll
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

exports.getFeed = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const profile = await UserProfile.findOne({ userId });
        if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }


        const userIds = [...profile.following, userId];

        const posts = await Post.find({ authorId: { $in: userIds } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feed', error: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { authorId, content } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }


        if (post.authorId !== authorId) {
            return res.status(403).json({ message: 'Unauthorized to edit this post' });
        }

        if (content) post.content = content;


        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
            const results = await Promise.all(uploadPromises);
            post.mediaUrls = results.map(r => r.secure_url);
        } else if (req.body.mediaUrls) {
            post.mediaUrls = Array.isArray(req.body.mediaUrls) ? req.body.mediaUrls : [req.body.mediaUrls];
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { authorId } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.authorId !== authorId) {
            return res.status(403).json({ message: 'Unauthorized to delete this post' });
        }

        await Post.findByIdAndDelete(postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(userId);
        let action = 'liked';
        if (likeIndex > -1) {

            post.likes.splice(likeIndex, 1);
            action = 'unliked';
        } else {

            post.likes.push(userId);

            if (post.authorId !== userId) {
                emitEvent('community-events', 'post_liked', {
                    likerId: userId,
                    authorId: post.authorId,
                    postId: post._id
                });
            }
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error liking post', error: error.message });
    }
};

exports.sharePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.shareCount += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error sharing post', error: error.message });
    }
};

exports.getTrendingFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;


        const posts = await Post.aggregate([
            {
                $addFields: {
                    engagementScore: { $add: [{ $size: "$likes" }, "$shareCount"] }
                }
            },
            { $sort: { engagementScore: -1, createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending feed', error: error.message });
    }
};

exports.searchByHashtag = async (req, res) => {
    try {
        const { tag } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const posts = await Post.find({ hashtags: tag })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error searching by hashtag', error: error.message });
    }
};

exports.votePoll = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, optionIndex } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (!post.poll || !post.poll.options) {
            return res.status(400).json({ message: 'Post does not contain a poll' });
        }


        if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
            return res.status(400).json({ message: 'Invalid poll option' });
        }


        let hasVoted = false;
        post.poll.options.forEach(opt => {
            if (opt.votes.includes(userId)) hasVoted = true;
        });

        if (hasVoted) {
            return res.status(400).json({ message: 'User already voted on this poll' });
        }

        post.poll.options[optionIndex].votes.push(userId);
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error voting on poll', error: error.message });
    }
};

exports.reportPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const Report = require('../models/Report');
        const { reporterId, reason } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.isReported = true;
        post.reportCount += 1;
        await post.save();

        const report = new Report({
            reporterId,
            targetType: 'Post',
            targetId: postId,
            reason
        });
        await report.save();

        res.json({ message: 'Post reported successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error reporting post', error: error.message });
    }
};
