const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment, Booking, Notification } = require('../models');
const emailService = require('../services/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
});

// POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const amountInPaise = Math.round(parseFloat(booking.amount) * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${bookingId}`,
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (e) {
      // Fallback for missing Razorpay keys (dev mode)
      order = { id: `order_dev_${Date.now()}`, amount: amountInPaise, currency: 'INR' };
    }

    await Payment.create({
      booking_id: bookingId,
      amount: booking.amount,
      status: 'pending',
      razorpay_order_id: order.id,
    });

    res.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) { next(err); }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, method } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder')
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature || process.env.NODE_ENV === 'development';
    if (!isValid) return res.status(400).json({ message: 'Payment verification failed' });

    const payment = await Payment.findOne({ where: { razorpay_order_id } });
    if (payment) {
      await payment.update({
        status: 'success',
        razorpay_payment_id,
        razorpay_signature,
        method: method || 'Razorpay',
      });
    }

    const booking = await Booking.findByPk(bookingId);
    if (booking) await booking.update({ status: 'confirmed' });

    await Notification.create({
      user_id: req.user.id,
      type: 'payment_success',
      title: 'Payment Successful!',
      message: `Payment of ₹${payment?.amount} received. Your session is confirmed.`,
      link: '/dashboard/student',
    });

    emailService.sendPaymentReceiptEmail(req.user.email, req.user.name, {
      amount: payment?.amount, bookingId, paymentId: razorpay_payment_id,
    }).catch(() => {});

    res.json({ message: 'Payment verified successfully', booking });
  } catch (err) { next(err); }
};

// GET /api/payments/history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({ where: { student_id: req.user.id }, attributes: ['id'] });
    const bookingIds = bookings.map((b) => b.id);
    const payments = await Payment.findAll({
      where: { booking_id: bookingIds },
      include: [{ model: Booking, as: 'booking' }],
      order: [['created_at', 'DESC']],
    });
    res.json(payments);
  } catch (err) { next(err); }
};
