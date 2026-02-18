// Twilio integration will be fully implemented in Phase 2
// For now, this is a placeholder/stub to allow the server to run without errors

const sendVerificationSMS = async (phone, code) => {
    try {
        console.log(`[SMS STUB] Sending verification code ${code} to ${phone}`);
        // In production: await client.messages.create({...})
        return { success: true, messageId: 'stub-sms-id' };
    } catch (error) {
        console.error('SMS send error:', error);
        return { success: false, error: error.message };
    }
};

const sendPasswordResetSMS = async (phone, code) => {
    try {
        console.log(`[SMS STUB] Sending password reset code ${code} to ${phone}`);
        // In production: await client.messages.create({...})
        return { success: true, messageId: 'stub-sms-id' };
    } catch (error) {
        console.error('SMS send error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationSMS,
    sendPasswordResetSMS
};
