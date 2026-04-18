const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tutor = sequelize.define('Tutor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  subject: { type: DataTypes.STRING(100), allowNull: false },
  experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  bio: { type: DataTypes.TEXT, allowNull: true },
  demo_video: { type: DataTypes.STRING(500), allowNull: true },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  review_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  approved: { type: DataTypes.BOOLEAN, defaultValue: false },
  tags: { type: DataTypes.TEXT, defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('tags')); } catch { return []; } },
    set(val) { this.setDataValue('tags', JSON.stringify(val)); },
  },
  availability: { type: DataTypes.TEXT, defaultValue: '{}',
    get() { try { return JSON.parse(this.getDataValue('availability')); } catch { return {}; } },
    set(val) { this.setDataValue('availability', JSON.stringify(val)); },
  },
}, { tableName: 'tutors', underscored: true });

module.exports = Tutor;
