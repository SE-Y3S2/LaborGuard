const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/', postController.createPost);
router.get('/feed/:userId', postController.getFeed);
router.get('/trending', postController.getTrendingFeed);
router.get('/hashtag/:tag', postController.searchByHashtag);
router.get('/:postId', postController.getPostById);
router.put('/:postId', postController.updatePost);
router.delete('/:postId', postController.deletePost);

router.post('/:postId/like', postController.likePost);
router.post('/:postId/share', postController.sharePost);
router.post('/:postId/poll', postController.votePoll);
router.post('/:postId/report', postController.reportPost);

module.exports = router;
