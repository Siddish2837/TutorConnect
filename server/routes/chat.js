const router = require('express').Router();
const ctrl = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.get('/conversations', authenticate, ctrl.getConversations);
router.get('/:userId', authenticate, ctrl.getConversation);

module.exports = router;
