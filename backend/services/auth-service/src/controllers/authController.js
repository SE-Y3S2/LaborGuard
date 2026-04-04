const authService = require('../services/authService');
const { getGridFSBucket } = require('../config/gridfs');
const { Readable } = require('stream');

/**
 * Manual helper to stream buffers to GridFS
 */
const uploadToGridFS = (file, bucket) => {
    return new Promise((resolve, reject) => {
        const filename = `${Date.now()}-laborguard-${file.originalname}`;
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype
        });

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        readableStream.pipe(uploadStream)
            .on('error', (err) => reject(err))
            .on('finish', () => resolve(filename));
    });
};

const register = async (req, res, next) => {
    try {
        console.log('--- Registration Request (Secure Stream) ---');
        const userData = { ...req.body };
        const bucket = getGridFSBucket();

        if (!bucket) {
            console.error('GridFS Error: Bucket not initialized');
            throw new Error('Database file storage is currently unavailable. Please try again in a moment.');
        }

        // Handle Manual GridFS Streaming from memory
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            console.log(`Step 1: Streaming ${req.files.length} files to GridFS...`);
            const uploadPromises = req.files.map(file => uploadToGridFS(file, bucket));
            userData.documents = await Promise.all(uploadPromises);
            console.log('Files successfully streamed:', userData.documents);
        } else {
            console.log('Step 1: No files provided');
        }

        console.log('Step 2: Creating User Record...');
        const result = await authService.registerUser(userData);
        
        console.log('Step 3: Registration SUCCESS');
        res.status(201).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        console.error('Registration Error:', error.message);
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const verify = async (req, res, next) => {
    try {
        const { userId, code, type } = req.body;
        const result = await authService.verifyCode(userId, code, type);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;
        const result = await authService.resetPassword(email, code, newPassword);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshAccessToken(refreshToken);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.logoutUser(refreshToken);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const getDocument = async (req, res, next) => {
    try {
        const bucket = getGridFSBucket();
        const filename = req.params.filename;
        
        if (!bucket) return res.status(500).json({ success: false, message: 'File storage unavailable' });

        const files = await bucket.find({ filename }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const file = files[0];
        if (file.contentType) {
            res.set('Content-Type', file.contentType);
        }

        const downloadStream = bucket.openDownloadStreamByName(filename);
        downloadStream.pipe(res);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    verify,
    forgotPassword,
    resetPassword,
    refresh,
    logout,
    changePassword,
    getDocument
};
