const express = require('express');
const router  = express.Router();
const userProfileController = require('../controllers/userProfileController');
const { protect }           = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:userId',           userProfileController.getProfile);
router.post('/',                 userProfileController.createOrUpdateProfile);
router.post('/follow',           userProfileController.followUser);
router.post('/unfollow',         userProfileController.unfollowUser);
router.post('/bookmark',         userProfileController.toggleBookmark);
router.get('/:userId/bookmarks', userProfileController.getBookmarks);

module.exports = router;