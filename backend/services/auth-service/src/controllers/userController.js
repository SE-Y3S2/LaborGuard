const User = require('../models/User');

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name, profile } = req.body;

        // Prevent updating restricted fields
        delete req.body.email;
        delete req.body.phone;
        delete req.body.password;
        delete req.body.role;
        delete req.body.isEmailVerified;
        delete req.body.isPhoneVerified;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {
                $set: {
                    name,
                    'profile.occupation': profile?.occupation,
                    'profile.location': profile?.location,
                    'profile.preferredLanguage': profile?.preferredLanguage
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile
};
