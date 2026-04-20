const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: true }, // Allow null for session-wide chat
  booking_id: { type: DataTypes.INTEGER, allowNull: true }, // Optional link to a live session
  content: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'messages', underscored: true });

module.exports = Message;
