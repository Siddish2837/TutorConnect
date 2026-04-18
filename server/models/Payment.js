const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  method: { type: DataTypes.STRING(50), defaultValue: 'UPI' },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  razorpay_order_id: { type: DataTypes.STRING(255), allowNull: true },
  razorpay_payment_id: { type: DataTypes.STRING(255), allowNull: true },
  razorpay_signature: { type: DataTypes.STRING(500), allowNull: true },
}, { tableName: 'payments', underscored: true });

module.exports = Payment;
