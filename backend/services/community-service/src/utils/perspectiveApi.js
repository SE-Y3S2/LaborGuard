const axios = require('axios');

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY || '';
const TOXICITY_THRESHOLD = parseFloat(process.env.TOXICITY_THRESHOLD) || 0.7;
const API_URL = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

/**
 * Analyze text for toxicity using Google's Perspective API.
 * Gracefully degrades if API key is missing or API call fails.
 * @param {string} text - The text to analyze
 * @returns {Promise<{ isToxic: boolean, score: number }>}
 */
const analyzeText = async (text) => {
    if (!PERSPECTIVE_API_KEY) {
        console.warn('[community-service] PERSPECTIVE_API_KEY not set — skipping toxicity check');
        return { isToxic: false, score: 0 };
    }

    if (!text || text.trim().length === 0) {
        return { isToxic: false, score: 0 };
    }

    try {
        const response = await axios.post(`${API_URL}?key=${PERSPECTIVE_API_KEY}`, {
            comment: { text },
            languages: ['en'],
            requestedAttributes: {
                TOXICITY: {}
            }
        });

        const score = response.data.attributeScores.TOXICITY.summaryScore.value;
        return {
            isToxic: score >= TOXICITY_THRESHOLD,
            score
        };
    } catch (error) {
        console.error('[community-service] Perspective API error:', error.message);
        // Graceful degradation: allow content through if API fails
        return { isToxic: false, score: 0 };
    }
};

module.exports = { analyzeText };
