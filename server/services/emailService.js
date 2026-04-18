const transporter = require('../config/email');

const FROM = process.env.EMAIL_FROM || 'TutorConnect <noreply@tutorconnect.in>';

const send = (to, subject, html) =>
  transporter.sendMail({ from: FROM, to, subject, html });

exports.sendVerificationEmail = (email, name, token) => {
  const link = `${process.env.CLIENT_URL}/verify/${token}`;
  return send(email, 'Verify your TutorConnect email', `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
      <h2 style="color:#6366f1">Welcome to TutorConnect, ${name}! 🎓</h2>
      <p style="color:#374151">Please verify your email address to get started.</p>
      <a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">Link expires in 24 hours. If you didn't register, ignore this email.</p>
    </div>`);
};

exports.sendPasswordResetEmail = (email, name, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
  return send(email, 'Reset your TutorConnect password', `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
      <h2 style="color:#6366f1">Password Reset Request</h2>
      <p style="color:#374151">Hi ${name}, click below to reset your password.</p>
      <a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#ef4444;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">Link expires in 1 hour.</p>
    </div>`);
};

exports.sendBookingRequestEmail = (email, tutorName, { studentName, date, time, duration, amount }) => {
  return send(email, 'New Booking Request – TutorConnect', `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
      <h2 style="color:#6366f1">New Session Request 📅</h2>
      <p><strong>${studentName}</strong> wants to book a ${duration}-min session with you.</p>
      <p>📅 <strong>${date}</strong> at <strong>${time}</strong></p>
      <p>💰 Amount: <strong>₹${amount}</strong></p>
      <a href="${process.env.CLIENT_URL}/dashboard/tutor" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View & Respond</a>
    </div>`);
};

exports.sendBookingConfirmationEmail = (email, studentName, { date, time, duration, sessionLink, amount }) => {
  return send(email, '✅ Booking Confirmed – TutorConnect', `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
      <h2 style="color:#10b981">Your Session is Confirmed! 🎉</h2>
      <p>Hi ${studentName}, your session has been confirmed.</p>
      <p>📅 <strong>${date}</strong> at <strong>${time}</strong> (${duration} min)</p>
      <p>💰 Amount paid: <strong>₹${amount}</strong></p>
      <a href="${sessionLink}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Join Session →</a>
    </div>`);
};

exports.sendPaymentReceiptEmail = (email, name, { amount, bookingId, paymentId }) => {
  return send(email, 'Payment Receipt – TutorConnect', `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
      <h2 style="color:#6366f1">Payment Receipt</h2>
      <p>Hi ${name}, your payment was successful!</p>
      <p>💰 Amount: <strong>₹${amount}</strong></p>
      <p>🔖 Booking ID: ${bookingId} | Payment ID: ${paymentId}</p>
    </div>`);
};

exports.sendSessionReminderEmail = (email, name, { tutorName, date, time, sessionLink }) => {
  return send(email, '⏰ Session Reminder – 1 Hour Away!', `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
      <h2 style="color:#f59e0b">Your session starts in 1 hour! ⏰</h2>
      <p>Hi ${name}, your session with <strong>${tutorName}</strong> is starting soon.</p>
      <p>📅 <strong>${date}</strong> at <strong>${time}</strong></p>
      <a href="${sessionLink}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Join Now →</a>
    </div>`);
};
