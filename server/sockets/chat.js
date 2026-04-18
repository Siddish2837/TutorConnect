const jwt = require('jsonwebtoken');
const { Message } = require('../models');

module.exports = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  chatNamespace.on('connection', (socket) => {
    // Join personal room
    socket.join(`user:${socket.userId}`);
    console.log(`Chat connected: user ${socket.userId}`);

    socket.on('join_conversation', ({ otherId }) => {
      const roomId = [socket.userId, otherId].sort().join(':');
      socket.join(`conv:${roomId}`);
    });

    socket.on('send_message', async ({ receiverId, content }) => {
      try {
        const message = await Message.create({
          sender_id: socket.userId,
          receiver_id: receiverId,
          content,
        });
        const roomId = [socket.userId, receiverId].sort().join(':');
        chatNamespace.to(`conv:${roomId}`).emit('new_message', message);
        // Notify receiver even if not in room
        chatNamespace.to(`user:${receiverId}`).emit('message_notification', {
          senderId: socket.userId, content,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ receiverId, isTyping }) => {
      const roomId = [socket.userId, receiverId].sort().join(':');
      socket.to(`conv:${roomId}`).emit('typing', { userId: socket.userId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`Chat disconnected: user ${socket.userId}`);
    });
  });

  // Also handle notifications on main io
  io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(`user:${decoded.id}`);
      } catch {}
    }
  });
};
