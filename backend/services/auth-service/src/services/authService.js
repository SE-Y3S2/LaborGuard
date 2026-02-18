const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const VerificationCode = require('../models/VerificationCode');
const { hashPassword, comparePassword } = require('../utils/passwordHelper');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
const { generateCodeWithExpiry } = require('../utils/codeGenerator');
const emailService = require('./emailService');
const smsService = require('./smsService');

const registerUser = async (userData) => {
    // Check existing user
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
        throw { statusCode: 400, message: 'Email already exists' };
    }

    const existingPhone = await User.findOne({ phone: userData.phone });
    if (existingPhone) {
        throw { statusCode: 400, message: 'Phone number already registered' };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = await User.create({
        ...userData,
        password: hashedPassword
    });

    // Generate verification code
    const { code, expiresAt } = generateCodeWithExpiry();

    // Save verification code
    await VerificationCode.create({
        userId: user._id,
        code,
        type: 'email',
        purpose: 'registration',
        expiresAt
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, code);

    return {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        message: 'User registered successfully. Please verify your email.'
    };
};

const loginUser = async (email, password) => {
    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw { statusCode: 401, message: 'Invalid credentials' };
    }

    // Check if active
    if (!user.isActive) {
        throw { statusCode: 403, message: 'Account is deactivated' };
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw { statusCode: 401, message: 'Invalid credentials' };
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id, accessToken); // simplified for example

    // Store refresh token
    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Return data (exclude password)
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
        accessToken,
        refreshToken,
        user: userResponse
    };
};

const verifyCode = async (userId, code, type) => {
    const record = await VerificationCode.findOne({
        userId,
        code,
        type,
        isUsed: false
    });

    if (!record) {
        throw { statusCode: 400, message: 'Invalid code' };
    }

    if (record.isExpired()) {
        throw { statusCode: 400, message: 'Code expired' };
    }

    // Mark as used
    record.isUsed = true;
    await record.save();

    // Update user verification status
    const updateField = type === 'email' ? { isEmailVerified: true } : { isPhoneVerified: true };
    await User.findByIdAndUpdate(userId, updateField);

    return { message: `${type} verified successfully` };
};

module.exports = {
    registerUser,
    loginUser,
    verifyCode
};
