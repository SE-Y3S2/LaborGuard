const express = require('express');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const authController = require('../controllers/authController');
const oauthController = require('../controllers/oauthController');
const { registerValidator, loginValidator, verifyCodeValidator, forgotPasswordValidator, resetPasswordValidator, changePasswordValidator } = require('../utils/validators');
const validate = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Rate limiting for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    }
});

// Update register to handle file uploads
router.post('/register', upload.array('documents', 5), registerValidator, validate, authController.register);

// Get document from GridFS
router.get('/documents/:filename', authController.getDocument);

router.post('/login', loginLimiter, loginValidator, validate, authController.login);
router.post('/verify', verifyCodeValidator, validate, authController.verify);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.post('/change-password', protect, changePasswordValidator, validate, authController.changePassword);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), oauthController.googleCallback);

module.exports = router;
