const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { updateProfileValidator } = require('../utils/validators');
const validate = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/me', userController.getProfile);
router.put('/me', updateProfileValidator, validate, userController.updateProfile);

module.exports = router;
