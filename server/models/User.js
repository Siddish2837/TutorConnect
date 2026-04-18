const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: true },
  auth_provider: { type: DataTypes.STRING(20), defaultValue: 'email' },
  role: { type: DataTypes.ENUM('student', 'tutor', 'admin'), defaultValue: 'student' },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verification_token: { type: DataTypes.STRING(255), allowNull: true },
  reset_token: { type: DataTypes.STRING(255), allowNull: true },
  reset_token_expires: { type: DataTypes.DATE, allowNull: true },
  avatar_color: { type: DataTypes.STRING(20), defaultValue: '#6366f1' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users', underscored: true });

module.exports = User;
