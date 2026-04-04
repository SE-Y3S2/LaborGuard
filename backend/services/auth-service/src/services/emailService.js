const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendVerificationEmail = async (toEmail, code) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'LaborGuard - Verify your Email',
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Welcome to LaborGuard!</h2>
                    <p>Thank you for registering. Please use the following 6-digit code to verify your email address. This code will expire in 15 minutes.</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #0056b3; letter-spacing: 5px; margin: 0;">${code}</h1>
                    </div>
                </div>
            `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Throwing error so caller knows delivery failed, but you can also choose to absorb it
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendVerificationEmail
};
