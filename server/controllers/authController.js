const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Tutor } = require('../models');
const emailService = require('../services/emailService');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, subject, experience, price } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const verification_token = crypto.randomBytes(32).toString('hex');
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const avatar_color = colors[Math.floor(Math.random() * colors.length)];

    const user = await User.create({
      name, email, password_hash,
      role: (role === 'admin') ? 'student' : (role || 'student'), // prevent self-promotion to admin
      verification_token, avatar_color,
    });

    if (role === 'tutor') {
      await Tutor.create({
        user_id: user.id,
        subject: subject || 'General',
        experience: experience || 0,
        price: price || 300,
        bio: '',
        tags: JSON.stringify([subject || 'General']),
        approved: false,
      });
    }

    // Send verification email (non-blocking)
    emailService.sendVerificationEmail(email, name, verification_token).catch(() => {});

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      token: generateToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, verified: user.verified, avatar_color: user.avatar_color },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ message: 'Account suspended' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    let tutorProfile = null;
    if (user.role === 'tutor') {
      tutorProfile = await Tutor.findOne({ where: { user_id: user.id } });
    }

    res.json({
      token: generateToken(user),
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, verified: user.verified,
        avatar_color: user.avatar_color,
        tutorId: tutorProfile?.id || null,
        tutorApproved: tutorProfile?.approved || null,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/verify/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });
    await user.update({ verified: true, verification_token: null });
    res.json({ message: 'Email verified successfully!' });
  } catch (err) { next(err); }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });
    const reset_token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await user.update({ reset_token, reset_token_expires: expires });
    emailService.sendPasswordResetEmail(email, user.name, reset_token).catch(() => {});
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ where: { reset_token: token } });
    if (!user || user.reset_token_expires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    const password_hash = await bcrypt.hash(password, 12);
    await user.update({ password_hash, reset_token: null, reset_token_expires: null });
    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = req.user;
  let tutorProfile = null;
  if (user.role === 'tutor') {
    tutorProfile = await Tutor.findOne({ where: { user_id: user.id } });
  }
  res.json({
    id: user.id, name: user.name, email: user.email,
    role: user.role, verified: user.verified, avatar_color: user.avatar_color,
    tutorId: tutorProfile?.id || null,
    tutorApproved: tutorProfile?.approved || null,
  });
};

// GET /api/auth/google/auth?role=
exports.getGoogleAuthUrl = async (req, res, next) => {
  try {
    const { role } = req.query; // 'student' or 'tutor'
    const googleService = require('../services/googleCalendarService');
    const url = googleService.getAuthUrl(role || 'student');
    res.json({ url });
  } catch (err) { next(err); }
};

// GET /api/auth/google/callback
exports.googleCallback = async (req, res, next) => {
  try {
    const { code, state: role } = req.query; // 'state' contains the role
    if (!code) return res.status(400).send('Code missing');

    const googleService = require('../services/googleCalendarService');
    const tokens = await googleService.getTokens(code);
    const googleUser = await googleService.getUserInfo(tokens);

    let user = await User.findOne({ where: { email: googleUser.email } });

    if (!user) {
      // Create new user
      const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
      const avatar_color = colors[Math.floor(Math.random() * colors.length)];
      
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        password_hash: 'GOOGLE_AUTH', // Placeholder
        role: role === 'tutor' ? 'tutor' : 'student',
        verified: true,
        avatar_color
      });

      if (user.role === 'tutor') {
        await Tutor.create({
          user_id: user.id,
          subject: 'General',
          price: 500,
          approved: false,
          google_refresh_token: tokens.refresh_token,
          google_connected: !!tokens.refresh_token
        });
      }
    } else {
      // Existing user: Link Google if it's a tutor and not connected yet
      if (user.role === 'tutor' && tokens.refresh_token) {
        const tutor = await Tutor.findOne({ where: { user_id: user.id } });
        if (tutor) {
          await tutor.update({
            google_refresh_token: tokens.refresh_token,
            google_connected: true
          });
        }
      }
    }

    const token = generateToken(user);
    
    // Redirect to frontend with token
    res.send(`
      <script>
        window.opener.postMessage({ type: 'AUTH_SUCCESS', token: "${token}", user: ${JSON.stringify({
          id: user.id, name: user.name, email: user.email, role: user.role, verified: user.verified
        })} }, "*");
        window.close();
      </script>
    `);
  } catch (err) { 
    console.error('Google Auth Error:', err);
    res.status(500).send('Authentication failed');
  }
};
