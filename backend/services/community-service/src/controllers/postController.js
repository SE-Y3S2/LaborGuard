const Post = require('../models/Post');
const UserProfile = require('../models/UserProfile');
const { emitEvent } = require('../utils/kafkaProducer');

exports.createPost = async (req, res) => {
    try {
        const { authorId, content, mediaUrls, hashtags, poll } = req.body;

        const post = new Post({
            authorId,
            content,
            mediaUrls: mediaUrls || [],
            hashtags: hashtags || [],
            poll: poll || undefined
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

        // Get posts from followed users + own posts
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
        const { authorId, content, mediaUrls } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Basic authorization check
        if (post.authorId !== authorId) {
            return res.status(403).json({ message: 'Unauthorized to edit this post' });
        }

        if (content) post.content = content;
        if (mediaUrls) post.mediaUrls = mediaUrls;

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
            // Unlike
            post.likes.splice(likeIndex, 1);
            action = 'unliked';
        } else {
            // Like
            post.likes.push(userId);

            // Emit like event, but only if they are not the author
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

        // Trending algorithm (simple): sorting by number of likes + shares
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

        // Validate option index
        if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
            return res.status(400).json({ message: 'Invalid poll option' });
        }

        // Check if user already voted to prevent multiple votes
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
        const Report = require('../models/Report'); // require here or at top
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
