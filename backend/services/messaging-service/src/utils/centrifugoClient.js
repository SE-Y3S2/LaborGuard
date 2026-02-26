const { axios } = require('axios');

const CENTRIFUGO_API_KEY = process.env.CENTRIFUGO_API_KEY || 'your-centrifugo-api-key';
const CENTRIFUGO_API_URL = process.env.CENTRIFUGO_API_URL || 'http://localhost:8000/api';

const publishToChannel = async (channel, data) => {
    try {
        const response = await axios.post(
            CENTRIFUGO_API_URL,
            {
                method: 'publish',
                params: {
                    channel,
                    data
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `apikey ${CENTRIFUGO_API_KEY}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Centrifugo publish error:', error.message);
        throw error;
    }
};

module.exports = {
    publishToChannel
};
