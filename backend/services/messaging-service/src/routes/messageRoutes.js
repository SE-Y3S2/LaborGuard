const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { upload } = require('../utils/cloudinaryConfig');

router.post('/conversations', messageController.createConversation);
router.get('/conversations/:userId', messageController.getConversations);

router.get('/messages/:conversationId', messageController.getMessages);
router.post('/messages', upload.array('media', 5), messageController.sendMessage);
router.patch('/messages/:conversationId/read', messageController.markAsRead);
router.delete('/messages/:messageId', messageController.deleteMessage);

module.exports = router;
