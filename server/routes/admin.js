const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

const adminOnly = [authenticate, requireRole('admin')];

router.get('/users', ...adminOnly, ctrl.getAllUsers);
router.put('/users/:id/suspend', ...adminOnly, ctrl.suspendUser);
router.get('/tutors/pending', ...adminOnly, ctrl.getPendingTutors);
router.put('/tutors/:id/approve', ...adminOnly, ctrl.approveTutor);
router.put('/tutors/:id/reject', ...adminOnly, ctrl.rejectTutor);
router.get('/bookings', ...adminOnly, ctrl.getAllBookings);
router.get('/revenue', ...adminOnly, ctrl.getRevenue);

module.exports = router;
