const router = require('express').Router();
const ctrl = require('../controllers/tutorController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', ctrl.getAllTutors);
router.get('/subjects', ctrl.getSubjects);
router.get('/:id', ctrl.getTutorById);
router.put('/profile', authenticate, requireRole('tutor'), ctrl.updateProfile);

module.exports = router;
