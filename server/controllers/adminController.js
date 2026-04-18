const { User, Tutor, Booking, Payment, Review } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash', 'verification_token', 'reset_token'] },
      order: [['created_at', 'DESC']],
    });
    res.json(users);
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/suspend
exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ is_active: !user.is_active });
    res.json({ message: user.is_active ? 'User activated' : 'User suspended', user });
  } catch (err) { next(err); }
};

// GET /api/admin/tutors/pending
exports.getPendingTutors = async (req, res, next) => {
  try {
    const tutors = await Tutor.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'avatar_color', 'created_at'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(tutors);
  } catch (err) { next(err); }
};

// PUT /api/admin/tutors/:id/approve
exports.approveTutor = async (req, res, next) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    await tutor.update({ approved: true });
    res.json({ message: 'Tutor approved', tutor });
  } catch (err) { next(err); }
};

// PUT /api/admin/tutors/:id/reject
exports.rejectTutor = async (req, res, next) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    await tutor.destroy();
    res.json({ message: 'Tutor registration rejected' });
  } catch (err) { next(err); }
};

// GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'student', attributes: ['name', 'email'] },
        { model: Tutor, as: 'tutor', include: [{ model: User, as: 'user', attributes: ['name'] }] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(bookings);
  } catch (err) { next(err); }
};

// GET /api/admin/revenue
exports.getRevenue = async (req, res, next) => {
  try {
    const total = await Payment.sum('amount', { where: { status: 'success' } });
    const monthly = await Payment.sum('amount', {
      where: {
        status: 'success',
        created_at: { [Op.gte]: new Date(new Date().setDate(1)) },
      },
    });
    const userCount = await User.count();
    const tutorCount = await Tutor.count({ where: { approved: true } });
    const bookingCount = await Booking.count();
    res.json({ total: total || 0, monthly: monthly || 0, userCount, tutorCount, bookingCount });
  } catch (err) { next(err); }
};
