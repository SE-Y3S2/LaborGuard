const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const VerificationCode = require('../models/VerificationCode');
const { hashPassword, comparePassword } = require('../utils/passwordHelper');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { generateCodeWithExpiry } = require('../utils/codeGenerator');
const emailService = require('./emailService');
const smsService = require('./smsService');

const registerUser = async (userData) => {
    const { confirmPassword, ...validUserData } = userData;

    // Set auto-approval for workers, others require admin approval
    if (!validUserData.role || validUserData.role === 'worker') {
        validUserData.isApproved = true;
    } else {
        validUserData.isApproved = false;
    }

    // Check existing user
    const existingEmail = await User.findOne({ email: validUserData.email });
    if (existingEmail) {
        throw { statusCode: 400, message: 'Email already exists' };
    }

    const existingPhone = await User.findOne({ phone: validUserData.phone });
    if (existingPhone) {
        throw { statusCode: 400, message: 'Phone number already registered' };
    }

    // Hash password
    const hashedPassword = await hashPassword(validUserData.password);

    // Create user
    const user = await User.create({
        ...validUserData,
        password: hashedPassword
    });

    // Generate two verification codes
    const emailCodeData = generateCodeWithExpiry();
    const smsCodeData = generateCodeWithExpiry();

    // Save Email verification code
    await VerificationCode.create({
        userId: user._id,
        code: emailCodeData.code,
        type: 'email',
        purpose: 'registration',
        expiresAt: emailCodeData.expiresAt
    });

    // Save SMS verification code
    await VerificationCode.create({
        userId: user._id,
        code: smsCodeData.code,
        type: 'sms',
        purpose: 'registration',
        expiresAt: smsCodeData.expiresAt
    });

    // Send verification email & SMS asynchronously
    try {
        await emailService.sendVerificationEmail(user.email, emailCodeData.code);
        // We catch SMS errors separately so fake numbers in dev don't break registration
        smsService.sendVerificationSMS(user.phone, smsCodeData.code).catch(err => console.error("SMS Warning:", err.message));
    } catch (error) {
        console.error("Verification dispatch error:", error);
    }

    return {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
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

    // Check if at least one contact method is verified
    if (!user.isEmailVerified && !user.isPhoneVerified) {
        throw { statusCode: 403, message: 'Please verify your email or phone number before logging in' };
    }

    // Check admin approval
    if (!user.isApproved) {
        throw { statusCode: 403, message: 'Please wait for the admin approval to login' };
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

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        // We throw 200 conceptually or simple success so attackers can't guess emails
        return { message: 'If that email is registered, a reset code was sent' };
    }

    const { code, expiresAt } = generateCodeWithExpiry();

    await VerificationCode.create({
        userId: user._id,
        code,
        type: 'email',
        purpose: 'password_reset',
        expiresAt
    });

    try {
        await emailService.sendVerificationEmail(user.email, code); // You can customize this email later
    } catch (error) {
        console.error("Forgot password email error:", error);
    }

    return { message: 'If that email is registered, a reset code was sent' };
};

const resetPassword = async (email, code, newPassword) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw { statusCode: 400, message: 'Invalid request' };
    }

    const record = await VerificationCode.findOne({
        userId: user._id,
        code,
        type: 'email',
        purpose: 'password_reset',
        isUsed: false
    });

    if (!record || record.isExpired()) {
        throw { statusCode: 400, message: 'Invalid or expired reset code' };
    }

    // Hash new password and update
    user.password = await hashPassword(newPassword);
    await user.save();

    // Mark code as used
    record.isUsed = true;
    await record.save();

    return { message: 'Password has been reset successfully. You can now login.' };
};

const refreshAccessToken = async (token) => {
    // Verify token structure
    const decoded = verifyRefreshToken(token);

    // Check if token exists in DB
    const refreshTokenDoc = await RefreshToken.findOne({ token, userId: decoded.userId });
    if (!refreshTokenDoc) {
        throw { statusCode: 401, message: 'Refresh token not found or revoked' };
    }

    if (refreshTokenDoc.isExpired()) {
        await RefreshToken.findByIdAndDelete(refreshTokenDoc._id);
        throw { statusCode: 401, message: 'Refresh token expired' };
    }

    // Get user to generate new access token
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
        throw { statusCode: 403, message: 'User not found or deactivated' };
    }

    // Generate new Access Token
    const newAccessToken = generateAccessToken(user._id, user.email, user.role);

    return {
        accessToken: newAccessToken
    };
};

const logoutUser = async (token) => {
    // Simply delete the refresh token from the DB to invalidate it
    const result = await RefreshToken.findOneAndDelete({ token });
    if (!result) {
        throw { statusCode: 400, message: 'Token not found' };
    }

    return { message: 'Logged out successfully' };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
        throw { statusCode: 401, message: 'Incorrect current password' };
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return { message: 'Password changed successfully' };
};

module.exports = {
    registerUser,
    loginUser,
    verifyCode,
    forgotPassword,
    resetPassword,
    refreshAccessToken,
    logoutUser,
    changePassword
};
