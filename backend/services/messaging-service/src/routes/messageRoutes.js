const express = require('express');
const router = express.Router();
const controller = require('../controllers/messageController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('image'), controller.createMessage);
router.get('/', controller.getAllMessages);
router.get('/:id', controller.getMessage);
router.put('/:id', controller.updateMessage);
router.delete('/:id', controller.deleteMessage);

module.exports = router;