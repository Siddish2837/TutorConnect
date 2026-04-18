const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  tutor_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING(20), allowNull: false },
  duration: { type: DataTypes.INTEGER, defaultValue: 60 },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rejected'),
    defaultValue: 'pending',
  },
  session_link: { type: DataTypes.STRING(500), allowNull: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  platform: { type: DataTypes.STRING(50), defaultValue: 'Google Meet' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  reminder_sent: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'bookings', underscored: true });

module.exports = Booking;
