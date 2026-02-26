const nsfwjs = require('nsfwjs');
const tf = require('@tensorflow/tfjs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

let model = null;

// NSFW threshold: if Porn + Hentai + Sexy combined score exceeds this, block
const NSFW_THRESHOLD = parseFloat(process.env.NSFW_THRESHOLD) || 0.5;

/**
 * Load the NSFWJS model (cached after first load)
 */
const loadModel = async () => {
    if (!model) {
        model = await nsfwjs.load();
        console.log('[community-service] NSFWJS model loaded');
    }
    return model;
};

/**
 * Convert an image buffer to a 3D tensor
 * Supports JPEG and PNG formats
 */
const imageBufferToTensor = (buffer, mimetype) => {
    let pixels, width, height;

    if (mimetype === 'image/png') {
        const png = PNG.sync.read(buffer);
        pixels = png.data; // RGBA
        width = png.width;
        height = png.height;
        // Convert RGBA to RGB
        const rgb = new Uint8Array(width * height * 3);
        for (let i = 0; i < width * height; i++) {
            rgb[i * 3] = pixels[i * 4];
            rgb[i * 3 + 1] = pixels[i * 4 + 1];
            rgb[i * 3 + 2] = pixels[i * 4 + 2];
        }
        return tf.tensor3d(rgb, [height, width, 3]);
    } else {
        // JPEG / default
        const rawImageData = jpeg.decode(buffer, { useTArray: true });
        pixels = rawImageData.data; // RGBA
        width = rawImageData.width;
        height = rawImageData.height;
        // Convert RGBA to RGB
        const rgb = new Uint8Array(width * height * 3);
        for (let i = 0; i < width * height; i++) {
            rgb[i * 3] = pixels[i * 4];
            rgb[i * 3 + 1] = pixels[i * 4 + 1];
            rgb[i * 3 + 2] = pixels[i * 4 + 2];
        }
        return tf.tensor3d(rgb, [height, width, 3]);
    }
};

/**
 * Classify an image buffer for NSFW content
 * @param {Buffer} imageBuffer - The image file buffer
 * @param {string} mimetype - The mime type of the image
 * @returns {Promise<{ isNSFW: boolean, scores: object }>}
 */
const classifyImage = async (imageBuffer, mimetype) => {
    try {
        const nsfwModel = await loadModel();

        // Decode image buffer to tensor
        const image = imageBufferToTensor(imageBuffer, mimetype);
        const predictions = await nsfwModel.classify(image);
        image.dispose(); // Free memory

        // Build scores object
        const scores = {};
        predictions.forEach(p => {
            scores[p.className] = p.probability;
        });

        // Sum NSFW categories
        const nsfwScore = (scores.Porn || 0) + (scores.Hentai || 0) + (scores.Sexy || 0);

        return {
            isNSFW: nsfwScore >= NSFW_THRESHOLD,
            nsfwScore,
            scores
        };
    } catch (error) {
        console.error('[community-service] NSFWJS classification error:', error.message);
        // Graceful degradation: allow image through if classification fails
        return { isNSFW: false, nsfwScore: 0, scores: {} };
    }
};

module.exports = { classifyImage, loadModel };
