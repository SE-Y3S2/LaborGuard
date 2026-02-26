const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const { upload } = require('../utils/cloudinaryConfig');
const { moderateContent } = require('../middleware/contentModeration');
const { moderateImages } = require('../middleware/imageModeration');

router.post('/', upload.single('media'), moderateImages, moderateContent, statusController.createStatus);
router.get('/feed/:userId', statusController.getStatuses);
router.delete('/:statusId', statusController.deleteStatus);

module.exports = router;
