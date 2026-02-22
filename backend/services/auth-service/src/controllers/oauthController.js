const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
const RefreshToken = require('../models/RefreshToken');

const googleCallback = async (req, res, next) => {
    try {
        const user = req.user;

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.email, user.role);
        const refreshToken = generateRefreshToken(user._id, accessToken);

        // Store refresh token
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        // Update last login
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        // Redirect to Frontend with tokens in URL
        const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}&refreshToken=${refreshToken}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('OAuth Callback Error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
};

module.exports = {
    googleCallback
};
