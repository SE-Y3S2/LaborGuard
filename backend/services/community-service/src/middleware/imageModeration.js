const { classifyImage } = require('../utils/nsfwCheck');

/**
 * Express middleware that checks uploaded image files for NSFW content
 * using NSFWJS. Must be placed AFTER multer middleware.
 * Blocks upload with 403 if any image is flagged as NSFW.
 * Video files bypass NSFWJS check (only images are supported).
 */
const moderateImages = async (req, res, next) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);

        if (files.length === 0) {
            return next();
        }

        // Only check image files, skip videos
        const imageFiles = files.filter(f => f.mimetype.startsWith('image/'));

        for (const file of imageFiles) {
            const result = await classifyImage(file.buffer, file.mimetype);

            if (result.isNSFW) {
                return res.status(403).json({
                    message: 'Image flagged as inappropriate content',
                    nsfwScore: result.nsfwScore,
                    categories: result.scores
                });
            }
        }

        next();
    } catch (error) {
        console.error('[community-service] Image moderation error:', error.message);
        // Graceful degradation: allow through if moderation fails
        next();
    }
};

module.exports = { moderateImages };
