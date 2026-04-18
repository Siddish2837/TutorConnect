const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getNotifications);
router.put('/read-all', authenticate, ctrl.markAllRead);
router.put('/:id/read', authenticate, ctrl.markOneRead);

module.exports = router;
