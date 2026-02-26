const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { upload } = require('../utils/cloudinaryConfig');
const { moderateContent } = require('../middleware/contentModeration');
const { moderateImages } = require('../middleware/imageModeration');

// Create post: upload up to 5 files → check NSFW images → check toxic text → create
router.post('/', upload.array('media', 5), moderateImages, moderateContent, postController.createPost);

// Get feeds
router.get('/feed/:userId', postController.getFeed);
router.get('/trending', postController.getTrendingFeed);
router.get('/hashtag/:tag', postController.searchByHashtag);

// Single post operations
router.get('/:postId', postController.getPostById);
router.put('/:postId', upload.array('media', 5), moderateImages, moderateContent, postController.updatePost);
router.delete('/:postId', postController.deletePost);

// Engagement
router.post('/:postId/like', postController.likePost);
router.post('/:postId/share', postController.sharePost);
router.post('/:postId/poll', postController.votePoll);
router.post('/:postId/report', postController.reportPost);

module.exports = router;
