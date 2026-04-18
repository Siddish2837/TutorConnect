const router = require('express').Router();
const ctrl = require('../controllers/reviewController');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/', authenticate, requireRole('student'), ctrl.createReview);
router.get('/tutor/:id', ctrl.getTutorReviews);

module.exports = router;
