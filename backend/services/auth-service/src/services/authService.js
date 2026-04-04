const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const VerificationCode = require('../models/VerificationCode');
const { hashPassword, comparePassword } = require('../utils/passwordHelper');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { generateCodeWithExpiry } = require('../utils/codeGenerator');
const emailService = require('./emailService');
const smsService = require('./smsService');

// ── registerUser ─────────────────────────────────────────────
const registerUser = async (userData) => {
  const { confirmPassword, ...validUserData } = userData;

  // Workers are auto-approved; all other roles require admin approval
  if (!validUserData.role || validUserData.role === 'worker') {
    validUserData.isApproved = true;
  } else {
    validUserData.isApproved = false;
  }

  const existingEmail = await User.findOne({ email: validUserData.email });
  if (existingEmail) throw { statusCode: 400, message: 'Email already exists' };

  const existingPhone = await User.findOne({ phone: validUserData.phone });
  if (existingPhone) throw { statusCode: 400, message: 'Phone number already registered' };

  const hashedPassword = await hashPassword(validUserData.password);

  console.log('AuthService: Creating user doc...');
  const user = await User.create({ ...validUserData, password: hashedPassword });
  if (!user) throw new Error('Failed to create user record');

  const userDoc = Array.isArray(user) ? user[0] : user;
  console.log('AuthService: User created successfully with ID:', userDoc?._id);

  // Generate email + SMS verification codes
  const emailCodeData = generateCodeWithExpiry();
  const smsCodeData = generateCodeWithExpiry();

  await VerificationCode.create({
    userId: userDoc._id,
    code: emailCodeData.code,
    type: 'email',
    purpose: 'registration',
    expiresAt: emailCodeData.expiresAt,
  });

  await VerificationCode.create({
    userId: userDoc._id,
    code: smsCodeData.code,
    type: 'sms',
    purpose: 'registration',
    expiresAt: smsCodeData.expiresAt,
  });

  try {
    await emailService.sendVerificationEmail(user.email, emailCodeData.code);
    // SMS errors are caught separately so fake dev numbers don't break registration
    smsService
      .sendVerificationSMS(user.phone, smsCodeData.code)
      .catch((err) => console.error('SMS Warning:', err.message));
  } catch (error) {
    console.error('Verification dispatch error:', error);
  }

  return {
    userId: userDoc._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    message: 'User registered successfully. Please verify your email.',
  };
};

// ── loginUser ────────────────────────────────────────────────
const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw { statusCode: 401, message: 'Invalid credentials' };
  if (!user.isActive) throw { statusCode: 403, message: 'Account is deactivated' };
  if (!user.isEmailVerified && !user.isPhoneVerified)
    throw { statusCode: 403, message: 'Please verify your email or phone number before logging in' };
  if (!user.isApproved)
    throw { statusCode: 403, message: 'Please wait for admin approval to login' };

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw { statusCode: 401, message: 'Invalid credentials' };

  const accessToken = generateAccessToken(user._id, user.email, user.role);
  const refreshToken = generateRefreshToken(user._id, accessToken);

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  user.lastLogin = Date.now();
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  return { accessToken, refreshToken, user: userResponse };
};

// ── verifyCode ───────────────────────────────────────────────
const verifyCode = async (userId, code, type) => {
  const record = await VerificationCode.findOne({ userId, code, type, isUsed: false });
  if (!record) throw { statusCode: 400, message: 'Invalid code' };
  if (record.isExpired()) throw { statusCode: 400, message: 'Code expired' };

  record.isUsed = true;
  await record.save();

  const updateField = type === 'email' ? { isEmailVerified: true } : { isPhoneVerified: true };
  await User.findByIdAndUpdate(userId, updateField);

  return { message: `${type} verified successfully` };
};

// ── resendVerificationCode  (FIX: new — was missing entirely) ─
const resendVerificationCode = async (email) => {
  const user = await User.findOne({ email });
  // Generic response to prevent user enumeration attacks
  if (!user) return { message: 'If that email is registered, a new verification code was sent' };

  if (user.isEmailVerified) {
    return { message: 'Email is already verified' };
  }

  // Invalidate all unused existing codes for this user
  await VerificationCode.updateMany(
    { userId: user._id, type: 'email', isUsed: false },
    { isUsed: true }
  );

  const { code, expiresAt } = generateCodeWithExpiry();
  await VerificationCode.create({
    userId: user._id,
    code,
    type: 'email',
    purpose: 'registration',
    expiresAt,
  });

  try {
    await emailService.sendVerificationEmail(user.email, code);
  } catch (err) {
    console.error('Resend verification email error:', err);
  }

  return { message: 'If that email is registered, a new verification code was sent' };
};

// ── forgotPassword ───────────────────────────────────────────
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  // Generic response to prevent email enumeration
  if (!user) return { message: 'If that email is registered, a reset code was sent' };

  const { code, expiresAt } = generateCodeWithExpiry();
  await VerificationCode.create({
    userId: user._id,
    code,
    type: 'email',
    purpose: 'password_reset',
    expiresAt,
  });

  try {
    await emailService.sendVerificationEmail(user.email, code);
  } catch (error) {
    console.error('Forgot password email error:', error);
  }

  return { message: 'If that email is registered, a reset code was sent' };
};

// ── resetPassword ────────────────────────────────────────────
// FIX: params are (email, code, newPassword) — no URL token
const resetPassword = async (email, code, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 400, message: 'Invalid request' };

  const record = await VerificationCode.findOne({
    userId: user._id,
    code,
    type: 'email',
    purpose: 'password_reset',
    isUsed: false,
  });

  if (!record || record.isExpired()) {
    throw { statusCode: 400, message: 'Invalid or expired reset code' };
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  record.isUsed = true;
  await record.save();

  return { message: 'Password has been reset successfully. You can now login.' };
};

// ── refreshAccessToken ───────────────────────────────────────
const refreshAccessToken = async (token) => {
  const decoded = verifyRefreshToken(token);
  const refreshTokenDoc = await RefreshToken.findOne({ token, userId: decoded.userId });

  if (!refreshTokenDoc) throw { statusCode: 401, message: 'Refresh token not found or revoked' };

  if (refreshTokenDoc.isExpired()) {
    await RefreshToken.findByIdAndDelete(refreshTokenDoc._id);
    throw { statusCode: 401, message: 'Refresh token expired' };
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw { statusCode: 403, message: 'User not found or deactivated' };

  const newAccessToken = generateAccessToken(user._id, user.email, user.role);
  return { accessToken: newAccessToken };
};

// ── logoutUser ───────────────────────────────────────────────
const logoutUser = async (token) => {
  const result = await RefreshToken.findOneAndDelete({ token });
  if (!result) throw { statusCode: 400, message: 'Token not found' };
  return { message: 'Logged out successfully' };
};

// ── changePassword ───────────────────────────────────────────
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw { statusCode: 404, message: 'User not found' };

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) throw { statusCode: 401, message: 'Incorrect current password' };

  user.password = await hashPassword(newPassword);
  await user.save();

  return { message: 'Password changed successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  verifyCode,
  resendVerificationCode,  // FIX: exported new function
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
  changePassword,
};
