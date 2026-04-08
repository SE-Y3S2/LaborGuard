const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const sendApplicationStatusEmail = async (toEmail, workerName, jobTitle, status) => {
    try {
        const transporter = createTransporter();
        const isAccepted = status === 'accepted';

        const subject = isAccepted 
            ? `Congratulations! Your application for "${jobTitle}" was Accepted`
            : `Status Update: Your application for "${jobTitle}"`;

        const html = isAccepted ? `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #2589f5;">Congratulations, ${workerName}!</h2>
                <p>Your application for the position of <strong>${jobTitle}</strong> has been <strong>ACCEPTED</strong>.</p>
                <p>The employer will contact you shortly with the next steps. Thank you for using LaborGuard!</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.85rem; color: #777;">Secure Fair Work • LaborGuard Team</p>
            </div>
        ` : `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #64748b;">Application Status Updated</h2>
                <p>Hello ${workerName},</p>
                <p>We wanted to inform you that your application for the position of <strong>${jobTitle}</strong> was not selected at this time.</p>
                <p>Don't be discouraged! There are many other opportunities waiting for you on the platform.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.85rem; color: #777;">Secure Fair Work • LaborGuard Team</p>
            </div>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject,
            html
        });

        console.log(`Application ${status} email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending application status email:', error);
        return false;
    }
};

module.exports = {
    sendApplicationStatusEmail
};
