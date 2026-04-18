const { Op } = require('sequelize');
const { Tutor, User, Review } = require('../models');

// GET /api/tutors
exports.getAllTutors = async (req, res, next) => {
  try {
    const { subject, minRating, maxPrice, name, page = 1, limit = 12 } = req.query;
    const where = { approved: true };
    if (subject) where.subject = subject;
    if (maxPrice) where.price = { [Op.lte]: parseFloat(maxPrice) };
    if (minRating) where.rating = { [Op.gte]: parseFloat(minRating) };

    const userWhere = {};
    if (name) userWhere.name = { [Op.like]: `%${name}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Tutor.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', where: userWhere, attributes: ['name', 'email', 'avatar_color', 'verified'] }],
      limit: parseInt(limit),
      offset,
      order: [['rating', 'DESC']],
    });

    res.json({
      tutors: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) { next(err); }
};

// GET /api/tutors/:id
exports.getTutorById = async (req, res, next) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'avatar_color'] },
        { model: Review, as: 'reviews',
          include: [{ model: User, as: 'student', attributes: ['name', 'avatar_color'] }],
          limit: 10, order: [['created_at', 'DESC']] },
      ],
    });
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    res.json(tutor);
  } catch (err) { next(err); }
};

// PUT /api/tutors/profile (tutor only)
exports.updateProfile = async (req, res, next) => {
  try {
    const { subject, experience, price, bio, tags, availability } = req.body;
    const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
    if (!tutor) return res.status(404).json({ message: 'Tutor profile not found' });

    await tutor.update({ subject, experience, price, bio, tags, availability });

    // Update user name if provided
    if (req.body.name) await req.user.update({ name: req.body.name });

    res.json({ message: 'Profile updated', tutor });
  } catch (err) { next(err); }
};

// GET /api/tutors/subjects
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Tutor.findAll({
      where: { approved: true },
      attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('subject')), 'subject']],
      raw: true,
    });
    res.json(subjects.map((s) => s.subject));
  } catch (err) { next(err); }
};
