const { Notification } = require('../models');

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 30,
    });
    res.json(notifications);
  } catch (err) { next(err); }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.update({ read: true }, { where: { user_id: req.user.id } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

// PUT /api/notifications/:id/read
exports.markOneRead = async (req, res, next) => {
  try {
    await Notification.update({ read: true }, { where: { id: req.params.id, user_id: req.user.id } });
    res.json({ message: 'Notification marked as read' });
  } catch (err) { next(err); }
};
