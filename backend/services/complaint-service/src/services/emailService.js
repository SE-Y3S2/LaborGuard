const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"LaborGuard" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[emailService] Email sent to ${to} — Message ID: ${info.messageId}`);
  return info;
};

// Sent to a worker when they successfully file a new complaint
const sendComplaintConfirmationEmail = async (email, name, complaint) => {
  const subject = `✅ Complaint Received — ${complaint.title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1a73e8;">LaborGuard — Complaint Received</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your complaint has been successfully submitted. Our team will review it shortly.</p>

      <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p><strong>Complaint ID:</strong> ${complaint._id}</p>
        <p><strong>Title:</strong> ${complaint.title}</p>
        <p><strong>Category:</strong> ${complaint.category.replace(/_/g, ' ')}</p>
        <p><strong>Priority:</strong> ${complaint.priority}</p>
        <p><strong>Status:</strong> ${complaint.status}</p>
        <p><strong>Filed On:</strong> ${new Date(complaint.createdAt).toLocaleString()}</p>
      </div>

      <p>You will be notified by email whenever the status of your complaint is updated.</p>
      <p>If you have additional information to add, please log in to your LaborGuard account and update your complaint while it is still <em>pending</em>.</p>

      <hr style="margin: 24px 0;" />
      <p style="color: #888; font-size: 12px;">
        This is an automated message from LaborGuard. Please do not reply to this email.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

// Sent to a worker when the status of their complaint changes
const sendStatusUpdateEmail = async (complaint, previousStatus, newStatus) => {
  if (!complaint.workerEmail) {
    console.warn(
      `[emailService] No workerEmail on complaint ${complaint._id} — skipping status update email`
    );
    return;
  }

  const statusLabels = {
    pending: 'Pending',
    under_review: 'Under Review',
    resolved: 'Resolved',
    rejected: 'Rejected'
  };

  const statusColors = {
    pending: '#f59e0b',
    under_review: '#3b82f6',
    resolved: '#10b981',
    rejected: '#ef4444'
  };

  const subject = `🔔 Complaint Status Updated — ${complaint.title}`;
  const color = statusColors[newStatus] || '#333';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1a73e8;">LaborGuard — Complaint Status Update</h2>
      <p>The status of your complaint has been updated.</p>

      <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p><strong>Complaint ID:</strong> ${complaint._id}</p>
        <p><strong>Title:</strong> ${complaint.title}</p>
        <p>
          <strong>Previous Status:</strong>
          <span style="color: #888;">${statusLabels[previousStatus] || previousStatus}</span>
        </p>
        <p>
          <strong>New Status:</strong>
          <span style="color: ${color}; font-weight: bold;">${statusLabels[newStatus] || newStatus}</span>
        </p>
        <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
      </div>

      ${newStatus === 'resolved'
      ? `<p style="color: #10b981;">✅ Your complaint has been resolved. Thank you for reaching out to LaborGuard.</p>`
      : ''
    }
      ${newStatus === 'rejected'
      ? `<p style="color: #ef4444;">Your complaint was not approved at this time. Please log in for more details.</p>`
      : ''
    }

      <p>Log in to your LaborGuard account to view the full details and status history of your complaint.</p>

      <hr style="margin: 24px 0;" />
      <p style="color: #888; font-size: 12px;">
        This is an automated message from LaborGuard. Please do not reply to this email.
      </p>
    </div>
  `;

  return sendEmail({ to: complaint.workerEmail, subject, html });
};

module.exports = {
  sendComplaintConfirmationEmail,
  sendStatusUpdateEmail
};