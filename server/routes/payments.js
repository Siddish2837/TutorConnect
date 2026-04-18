const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/create-order', authenticate, ctrl.createOrder);
router.post('/verify', authenticate, ctrl.verifyPayment);
router.get('/history', authenticate, ctrl.getPaymentHistory);

module.exports = router;
