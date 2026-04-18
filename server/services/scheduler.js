const cron = require('node-cron');
const { Op } = require('sequelize');
const { Booking, User, Tutor } = require('../models');
const emailService = require('./emailService');

// Run every 15 minutes — send reminders 1hr before session
cron.schedule('*/15 * * * *', async () => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const todayDate = now.toISOString().split('T')[0];

    const bookings = await Booking.findAll({
      where: {
        date: todayDate,
        status: 'confirmed',
        reminder_sent: false,
      },
      include: [
        { model: User, as: 'student' },
        { model: Tutor, as: 'tutor', include: [{ model: User, as: 'user' }] },
      ],
    });

    for (const booking of bookings) {
      // Parse session time
      const [hourMin, period] = booking.time.split(' ');
      let [hours, minutes] = hourMin.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const sessionTime = new Date(todayDate);
      sessionTime.setHours(hours, minutes, 0, 0);

      const diff = sessionTime - now;
      if (diff > 0 && diff <= 75 * 60 * 1000) {
        await emailService.sendSessionReminderEmail(
          booking.student.email,
          booking.student.name,
          {
            tutorName: booking.tutor.user.name,
            date: booking.date,
            time: booking.time,
            sessionLink: booking.session_link,
          }
        );
        await booking.update({ reminder_sent: true });
        console.log(`📧 Reminder sent for booking ${booking.id}`);
      }
    }
  } catch (err) {
    console.error('Scheduler error:', err.message);
  }
});

console.log('⏰ Session reminder scheduler started');
