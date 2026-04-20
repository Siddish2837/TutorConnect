const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, ctrl.register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], validate, ctrl.login);

router.get('/verify/:token', ctrl.verifyEmail);
router.post('/forgot-password', [body('email').isEmail()], validate, ctrl.forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], validate, ctrl.resetPassword);
router.get('/me', authenticate, ctrl.getMe);

router.get('/google/auth', ctrl.getGoogleAuthUrl);
router.get('/google/callback', ctrl.googleCallback);

module.exports = router;
