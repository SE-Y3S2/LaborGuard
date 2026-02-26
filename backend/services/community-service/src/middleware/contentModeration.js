const { analyzeText } = require('../utils/perspectiveApi');

/**
 * Express middleware that checks req.body.content for toxicity
 * using the Perspective API. Blocks toxic content with 403.
 */
const moderateContent = async (req, res, next) => {
    const content = req.body.content;

    if (!content || content.trim().length === 0) {
        return next();
    }

    try {
        const result = await analyzeText(content);

        if (result.isToxic) {
            return res.status(403).json({
                message: 'Content flagged as toxic',
                toxicityScore: result.score
            });
        }

        // Attach score to request for optional logging
        req.toxicityScore = result.score;
        next();
    } catch (error) {
        console.error('[community-service] Content moderation error:', error.message);
        // If moderation fails, allow content through (graceful degradation)
        next();
    }
};

module.exports = { moderateContent };
