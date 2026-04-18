const { Review, Tutor, User, Booking } = require('../models');
const { Op } = require('sequelize');

// POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { tutorId, bookingId, rating, comment } = req.body;
    const existing = await Review.findOne({ where: { student_id: req.user.id, booking_id: bookingId } });
    if (existing) return res.status(409).json({ message: 'Review already submitted for this session' });

    const review = await Review.create({
      student_id: req.user.id,
      tutor_id: tutorId,
      booking_id: bookingId,
      rating, comment,
    });

    // Recalculate tutor rating
    const allReviews = await Review.findAll({ where: { tutor_id: tutorId } });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Tutor.update(
      { rating: parseFloat(avg.toFixed(2)), review_count: allReviews.length },
      { where: { id: tutorId } }
    );

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) { next(err); }
};

// GET /api/reviews/tutor/:id
exports.getTutorReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { tutor_id: req.params.id },
      include: [{ model: User, as: 'student', attributes: ['name', 'avatar_color'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(reviews);
  } catch (err) { next(err); }
};
