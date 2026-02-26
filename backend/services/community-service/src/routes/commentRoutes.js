const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { moderateContent } = require('../middleware/contentModeration');

router.post('/:postId', moderateContent, commentController.addComment);
router.get('/:postId', commentController.getComments);
router.delete('/:commentId', commentController.deleteComment);
router.post('/:commentId/report', commentController.reportComment);

module.exports = router;
