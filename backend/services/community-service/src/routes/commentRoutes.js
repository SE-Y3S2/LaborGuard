const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { moderateContent } = require('../middleware/contentModeration');

// POST /api/comments/:postId — check toxicity before adding comment
router.post('/:postId', moderateContent, commentController.addComment);

// GET /api/comments/:postId
router.get('/:postId', commentController.getComments);

// DELETE /api/comments/:commentId
router.delete('/:commentId', commentController.deleteComment);

// POST /api/comments/:commentId/report
router.post('/:commentId/report', commentController.reportComment);

module.exports = router;
