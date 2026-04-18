const router = require('express').Router();
const ctrl = require('../controllers/bookingController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/slots', ctrl.getAvailableSlots);
router.post('/', authenticate, requireRole('student'), ctrl.createBooking);
router.get('/my', authenticate, ctrl.getMyBookings);
router.get('/:id', authenticate, ctrl.getBookingById);
router.put('/:id/respond', authenticate, requireRole('tutor'), ctrl.respondBooking);
router.put('/:id/cancel', authenticate, ctrl.cancelBooking);
router.put('/:id/complete', authenticate, ctrl.completeBooking);

module.exports = router;
