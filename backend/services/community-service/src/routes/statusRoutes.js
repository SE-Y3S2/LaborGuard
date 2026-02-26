const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const { upload } = require('../utils/cloudinaryConfig');
const { moderateContent } = require('../middleware/contentModeration');
const { moderateImages } = require('../middleware/imageModeration');

// Create status: upload single media → check NSFW image → check toxic text → create
router.post('/', upload.single('media'), moderateImages, moderateContent, statusController.createStatus);

// Get statuses feed
router.get('/feed/:userId', statusController.getStatuses);

// Delete status
router.delete('/:statusId', statusController.deleteStatus);

module.exports = router;
