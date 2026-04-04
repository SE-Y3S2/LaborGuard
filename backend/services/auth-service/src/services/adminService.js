const User = require('../models/User');

const getAllUsers = async (query) => {
    // Pagination setup
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Optional filtering
    let filter = {};
    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

    const users = await User.find(filter)
        .select('-password') // Never return passwords
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const updateUserRole = async (userId, newRole) => {
    const validRoles = ['worker', 'lawyer', 'ngo', 'employer', 'admin'];
    if (!validRoles.includes(newRole)) {
        throw { statusCode: 400, message: 'Invalid role provided' };
    }

    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }

    user.role = newRole;
    await user.save();

    return { message: `User role updated to ${newRole}` };
};

const updateAccountStatus = async (userId, isActive) => {
    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }

    user.isActive = isActive;
    await user.save();

    return { message: `User account has been ${isActive ? 'activated' : 'deactivated'}` };
};

const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }

    // Note: We might also want to delete their RefreshTokens and VerificationCodes to clean up completely

    return { message: 'User deleted permanently' };
};

const approveUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }

    if (user.isApproved) {
        return { message: 'User is already approved' };
    }

    user.isApproved = true;
    await user.save();

    return { message: `${user.role} user has been approved successfully` };
};

module.exports = {
    getAllUsers,
    updateUserRole,
    updateAccountStatus,
    deleteUser,
    approveUser
};
