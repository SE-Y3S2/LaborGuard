const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');

router.get('/:userId', userProfileController.getProfile);
router.get('/:userId/bookmarks', userProfileController.getBookmarks);

router.post('/follow', userProfileController.followUser);
router.post('/unfollow', userProfileController.unfollowUser);
router.post('/bookmark', userProfileController.toggleBookmark);
router.post('/', userProfileController.createOrUpdateProfile);

module.exports = router;
