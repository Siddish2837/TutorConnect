const sequelize = require('../config/db');
const User = require('./User');
const Tutor = require('./Tutor');
const Booking = require('./Booking');
const Payment = require('./Payment');
const Review = require('./Review');
const Message = require('./Message');
const Notification = require('./Notification');

// Associations
Tutor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Tutor, { foreignKey: 'user_id', as: 'tutorProfile' });

Booking.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Booking.belongsTo(Tutor, { foreignKey: 'tutor_id', as: 'tutor' });
User.hasMany(Booking, { foreignKey: 'student_id', as: 'bookings' });
Tutor.hasMany(Booking, { foreignKey: 'tutor_id', as: 'bookings' });

Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment' });

Review.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Review.belongsTo(Tutor, { foreignKey: 'tutor_id', as: 'tutor' });
Tutor.hasMany(Review, { foreignKey: 'tutor_id', as: 'reviews' });

Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
Message.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Booking.hasMany(Message, { foreignKey: 'booking_id', as: 'sessionMessages' });

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, Tutor, Booking, Payment, Review, Message, Notification };
