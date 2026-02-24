const { body } = require('express-validator');
const { validatePasswordStrength } = require('./passwordHelper');

const registerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required'),

    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('phone')
        .trim()
        .matches(/^\+947[0-9]{8}$/).withMessage('Please provide a valid Sri Lankan phone number (+947XXXXXXXX)'),

    body('password')
        .custom((value) => {
            const result = validatePasswordStrength(value);
            if (!result.valid) {
                throw new Error(result.message);
            }
            return true;
        }),

    body('role')
        .optional()
        .isIn(['worker', 'lawyer', 'ngo', 'employer', 'admin']).withMessage('Invalid role')
];

const loginValidator = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email'),

    body('password')
        .notEmpty().withMessage('Password is required')
];

const verifyCodeValidator = [
    body('userId')
        .notEmpty().withMessage('User ID is required'),

    body('code')
        .trim()
        .isLength({ min: 6, max: 6 }).withMessage('Invalid code length'),

    body('type')
        .isIn(['email', 'sms']).withMessage('Invalid verification type')
];

const updateProfileValidator = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Name cannot be empty'),

    body('profile.occupation')
        .optional()
        .trim(),

    body('profile.location')
        .optional()
        .trim(),

    body('profile.preferredLanguage')
        .optional()
        .isIn(['en', 'si', 'ta']).withMessage('Invalid language selection')
];

const changePasswordValidator = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),

    body('newPassword')
        .custom((value) => {
            const result = validatePasswordStrength(value);
            if (!result.valid) {
                throw new Error(result.message);
            }
            return true;
        })
];

const forgotPasswordValidator = [
    body('email')
        .isEmail().withMessage('Valid email is required')
];

const resetPasswordValidator = [
    body('email')
        .isEmail().withMessage('Valid email is required'),

    body('code')
        .isLength({ min: 6, max: 6 }).withMessage('Valid code is required'),

    body('newPassword')
        .custom((value) => {
            const result = validatePasswordStrength(value);
            if (!result.valid) {
                throw new Error(result.message);
            }
            return true;
        })
];

module.exports = {
    registerValidator,
    loginValidator,
    verifyCodeValidator,
    updateProfileValidator,
    changePasswordValidator,
    forgotPasswordValidator,
    resetPasswordValidator
};
