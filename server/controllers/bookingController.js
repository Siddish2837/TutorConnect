const { Booking, User, Tutor, Notification } = require('../models');
const emailService = require('../services/emailService');
const { generateMeetLink } = require('../utils/helpers');

// POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { tutorId, date, time, duration, platform } = req.body;
    const tutor = await Tutor.findByPk(tutorId, { include: [{ model: User, as: 'user' }] });
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    if (!tutor.approved) return res.status(400).json({ message: 'Tutor not yet approved' });

    // Check for slot conflict
    const conflict = await Booking.findOne({
      where: { tutor_id: tutorId, date, time, status: ['pending', 'confirmed'] },
    });
    if (conflict) return res.status(409).json({ message: 'This slot is already booked' });

    const amount = (tutor.price * duration) / 60;
    const session_link = generateMeetLink();

    const booking = await Booking.create({
      student_id: req.user.id,
      tutor_id: tutorId,
      date, time, duration, platform: platform || 'Google Meet',
      status: 'pending',
      session_link,
      amount,
    });

    // Notify tutor
    await Notification.create({
      user_id: tutor.user_id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${req.user.name} has requested a ${duration}-min session on ${date} at ${time}.`,
      link: '/dashboard/tutor',
    });

    // Email tutor
    emailService.sendBookingRequestEmail(tutor.user.email, tutor.user.name, {
      studentName: req.user.name, date, time, duration, amount,
    }).catch(() => {});

    req.io?.to(`user:${tutor.user_id}`).emit('notification', { type: 'booking_request' });

    res.status(201).json({ message: 'Booking request sent', booking });
  } catch (err) { next(err); }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const where = req.user.role === 'student'
      ? { student_id: req.user.id }
      : {};

    let tutorWhere = {};
    if (req.user.role === 'tutor') {
      const tutor = await Tutor.findOne({ where: { user_id: req.user.id } });
      if (!tutor) return res.json([]);
      tutorWhere = { tutor_id: tutor.id };
    }

    const bookings = await Booking.findAll({
      where: { ...where, ...tutorWhere },
      include: [
        { model: User, as: 'student', attributes: ['name', 'email', 'avatar_color'] },
        { model: Tutor, as: 'tutor', include: [{ model: User, as: 'user', attributes: ['name', 'avatar_color'] }] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(bookings);
  } catch (err) { next(err); }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: User, as: 'student', attributes: ['name', 'email', 'avatar_color'] },
        { model: Tutor, as: 'tutor', include: [{ model: User, as: 'user', attributes: ['name', 'avatar_color'] }] },
      ],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) { next(err); }
};

// PUT /api/bookings/:id/respond (tutor)
exports.respondBooking = async (req, res, next) => {
  try {
    const { status } = req.body; // 'confirmed' or 'rejected'
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: User, as: 'student' }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    await booking.update({ status });

    // Notify student
    await Notification.create({
      user_id: booking.student_id,
      type: status === 'confirmed' ? 'booking_confirmed' : 'booking_rejected',
      title: status === 'confirmed' ? 'Booking Confirmed!' : 'Booking Rejected',
      message: status === 'confirmed'
        ? `Your session on ${booking.date} at ${booking.time} has been confirmed!`
        : `Your booking on ${booking.date} at ${booking.time} was rejected.`,
      link: '/dashboard/student',
    });

    if (status === 'confirmed') {
      emailService.sendBookingConfirmationEmail(booking.student.email, booking.student.name, {
        date: booking.date, time: booking.time, duration: booking.duration,
        sessionLink: booking.session_link, amount: booking.amount,
      }).catch(() => {});
    }

    req.io?.to(`user:${booking.student_id}`).emit('notification', { type: status });
    res.json({ message: `Booking ${status}`, booking });
  } catch (err) { next(err); }
};

// PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.student_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await booking.update({ status: 'cancelled' });
    res.json({ message: 'Booking cancelled. Refund will be processed in 3-5 days.' });
  } catch (err) { next(err); }
};

// PUT /api/bookings/:id/complete
exports.completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await booking.update({ status: 'completed' });
    res.json({ message: 'Session marked as completed', booking });
  } catch (err) { next(err); }
};

// GET /api/bookings/slots?tutorId=&date=
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { tutorId, date } = req.query;
    
    // Get current time in IST (Asia/Kolkata) to match user local time
    const istTimeParts = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', hourCycle: 'h23' 
    }).formatToParts(new Date());

    const ist = {};
    istTimeParts.forEach(p => ist[p.type] = p.value);

    // Determine if query date is today in IST
    const [qYear, qMonth, qDay] = date.split('-').map(Number);
    const isToday = parseInt(ist.year) === qYear && 
                    parseInt(ist.month) === qMonth && 
                    parseInt(ist.day) === qDay;
    
    const currentHours = parseInt(ist.hour);

    const allSlots = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'];
    const booked = await Booking.findAll({
      where: { tutor_id: tutorId, date, status: ['pending', 'confirmed'] },
      attributes: ['time'],
    });
    const bookedTimes = booked.map((b) => b.time);
    const slots = allSlots.map((t) => {
      let available = !bookedTimes.includes(t);
      if (isToday && available) {
        let [timeStr, period] = t.split(' ');
        let [hour] = timeStr.split(':');
        hour = parseInt(hour, 10);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        
        // Disable slots that are in the past or currently starting
        if (hour <= currentHours) {
          available = false;
        }
      }
      return { time: t, available };
    });
    res.json(slots);
  } catch (err) { next(err); }
};
