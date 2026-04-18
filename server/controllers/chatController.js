const { Message, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/messages/:userId — conversation history
exports.getConversation = async (req, res, next) => {
  try {
    const otherId = parseInt(req.params.userId);
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id, receiver_id: otherId },
          { sender_id: otherId, receiver_id: req.user.id },
        ],
      },
      order: [['created_at', 'ASC']],
    });
    // Mark as read
    await Message.update({ read: true }, {
      where: { sender_id: otherId, receiver_id: req.user.id, read: false },
    });
    res.json(messages);
  } catch (err) { next(err); }
};

// GET /api/messages/conversations — list conversations
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const msgs = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
      },
      order: [['created_at', 'DESC']],
    });

    const convMap = {};
    for (const m of msgs) {
      const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      if (!convMap[otherId]) convMap[otherId] = m;
    }

    const otherIds = Object.keys(convMap);
    const users = await User.findAll({
      where: { id: otherIds },
      attributes: ['id', 'name', 'avatar_color', 'role'],
    });

    const conversations = users.map((u) => ({
      user: u,
      lastMessage: convMap[u.id],
      unread: msgs.filter((m) => m.sender_id === u.id && m.receiver_id === userId && !m.read).length,
    }));

    res.json(conversations);
  } catch (err) { next(err); }
};
