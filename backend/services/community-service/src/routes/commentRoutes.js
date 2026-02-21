const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// POST /api/comments/:postId
router.post('/:postId', commentController.addComment);

// GET /api/comments/:postId
router.get('/:postId', commentController.getComments);

// DELETE /api/comments/:commentId
router.delete('/:commentId', commentController.deleteComment);

// POST /api/comments/:commentId/report
router.post('/:commentId/report', commentController.reportComment);

module.exports = router;
