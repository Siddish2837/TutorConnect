const router = require('express').Router();
const ctrl = require('../controllers/tutorController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', ctrl.getAllTutors);
router.get('/subjects', ctrl.getSubjects);
router.get('/:id', ctrl.getTutorById);
router.put('/profile', authenticate, requireRole('tutor'), ctrl.updateProfile);

router.get('/google/auth', authenticate, requireRole('tutor'), ctrl.getGoogleAuthUrl);
router.get('/google/callback', authenticate, requireRole('tutor'), ctrl.googleCallback);

module.exports = router;
