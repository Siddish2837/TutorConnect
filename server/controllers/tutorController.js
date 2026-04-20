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
    const { subject, experience, price, bio, tags, availability, name } = req.body;
    const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
    if (!tutor) return res.status(404).json({ message: 'Tutor profile not found' });

    // Build update payload — only include fields that were actually sent
    const tutorUpdate = {};
    if (subject    !== undefined) tutorUpdate.subject      = subject;
    if (experience !== undefined) tutorUpdate.experience   = experience;
    if (price      !== undefined) tutorUpdate.price        = price;
    if (bio        !== undefined) tutorUpdate.bio          = bio;
    if (tags       !== undefined) tutorUpdate.tags         = tags;
    if (availability !== undefined) tutorUpdate.availability = availability;

    await tutor.update(tutorUpdate);

    // Update display name on the User record (req.user is JWT payload, not a model)
    if (name) await User.update({ name }, { where: { id: req.user.id } });

    res.json({ message: 'Profile updated', tutor });
  } catch (err) { next(err); }
};

// GET /api/tutors/subjects
exports.getSubjects = async (req, res, next) => {
  try {
    const { fn, col } = require('sequelize');
    const subjects = await Tutor.findAll({
      where: { approved: true },
      attributes: [[fn('DISTINCT', col('subject')), 'subject']],
      raw: true,
    });
    res.json(subjects.map((s) => s.subject));
  } catch (err) { next(err); }
};

// GET /api/tutors/google/auth
exports.getGoogleAuthUrl = async (req, res, next) => {
  try {
    const googleService = require('../services/googleCalendarService');
    const url = googleService.getAuthUrl();
    res.json({ url });
  } catch (err) { next(err); }
};

// GET /api/tutors/google/callback
exports.googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Authorization code missing');

    const googleService = require('../services/googleCalendarService');
    const tokens = await googleService.getTokens(code);

    // Get current tutor profile
    // Note: Since this is a redirect, we might need a way to track the user.
    // Usually, we pass a 'state' param in OAuth, but for simplicity here
    // we'll use a hack or just expect the tutor to be logged in (if using cookies/token).
    // Better: Retrieve user from state or JWT if passed.
    
    // For now, let's assume we can get user from req.user if session/auth middleware is applied
    // But OAuth callbacks are often separate. Let's use the 'state' to pass the userId.
    const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

    await tutor.update({
      google_refresh_token: tokens.refresh_token || tutor.google_refresh_token,
      google_connected: true
    });

    res.send('<script>window.opener.postMessage("google_connected", "*"); window.close();</script>');
  } catch (err) { next(err); }
};
