const adminService = require('../services/adminService');

const getAllUsers = async (req, res, next) => {
    try {
        const result = await adminService.getAllUsers(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, message: 'Role is required' });
        }

        const result = await adminService.updateUserRole(id, role);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const deactivateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body; // Expecting boolean

        if (isActive === undefined) {
            return res.status(400).json({ success: false, message: 'isActive status is required' });
        }

        const result = await adminService.updateAccountStatus(id, isActive);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await adminService.deleteUser(id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const approveUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await adminService.approveUser(id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    deactivateUser,
    deleteUser,
    approveUser
};
