const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.warn('⚠️  Email service not configured:', err.message);
    console.warn('   → Gmail requires an App Password (not your regular password).');
    console.warn('   → Generate one at: https://myaccount.google.com/apppasswords');
    console.warn('   → Update EMAIL_PASS in server/.env with your App Password.');
    console.warn('   → Email sending is disabled until this is fixed.');
  } else {
    console.log('📧 Email service ready');
  }
});

module.exports = transporter;
