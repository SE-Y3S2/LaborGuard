const nsfwjs = require('nsfwjs');
const { classifyImage } = require('../src/utils/nsfwCheck');

jest.mock('nsfwjs');
jest.mock('@tensorflow/tfjs');

describe('NSFWJS Check Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should classify a safe image as not NSFW', async () => {
        const mockClassify = jest.fn().mockResolvedValue([
            { className: 'Neutral', probability: 0.9 },
            { className: 'Drawing', probability: 0.05 },
            { className: 'Porn', probability: 0.02 },
            { className: 'Hentai', probability: 0.01 },
            { className: 'Sexy', probability: 0.02 }
        ]);
        nsfwjs.load.mockResolvedValue({ classify: mockClassify });

        const result = await classifyImage(Buffer.from('safe-image'), 'image/jpeg');

        expect(result.isNSFW).toBe(false);
        expect(result.nsfwScore).toBeLessThan(0.5);
        expect(result.scores.Neutral).toBe(0.9);
    });

    it('should classify an NSFW image as NSFW', async () => {
        const mockClassify = jest.fn().mockResolvedValue([
            { className: 'Neutral', probability: 0.1 },
            { className: 'Drawing', probability: 0.05 },
            { className: 'Porn', probability: 0.6 },
            { className: 'Hentai', probability: 0.1 },
            { className: 'Sexy', probability: 0.15 }
        ]);
        nsfwjs.load.mockResolvedValue({ classify: mockClassify });

        const result = await classifyImage(Buffer.from('nsfw-image'), 'image/jpeg');

        expect(result.isNSFW).toBe(true);
        expect(result.nsfwScore).toBeGreaterThanOrEqual(0.5);
    });

    it('should gracefully handle classification errors', async () => {
        nsfwjs.load.mockRejectedValue(new Error('Model load failed'));

        const result = await classifyImage(Buffer.from('broken'), 'image/jpeg');

        expect(result.isNSFW).toBe(false);
        expect(result.nsfwScore).toBe(0);
    });
});
