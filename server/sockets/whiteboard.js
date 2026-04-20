const jwt = require('jsonwebtoken');

module.exports = (io) => {
  const wbNamespace = io.of('/whiteboard');

  wbNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.warn('Whiteboard Socket: No token provided');
        return next(new Error('Auth required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      console.log(`Whiteboard Socket: Auth success for user ${socket.userId}`);
      next();
    } catch (err) {
      console.error('Whiteboard Socket: Auth failure:', err.message);
      next(new Error('Invalid token'));
    }
  });

  wbNamespace.on('connection', (socket) => {
    console.log(`✅ Whiteboard Session Connected: user ${socket.userId}`);

    socket.on('join_session', ({ bookingId }) => {
      console.log(`📡 Socket ${socket.id} joining room: session:${bookingId}`);
      socket.join(`session:${bookingId}`);
      socket.emit('joined', { bookingId });
    });

    socket.on('draw', ({ bookingId, drawData }) => {
      socket.to(`session:${bookingId}`).emit('draw', drawData);
    });

    socket.on('clear_canvas', ({ bookingId }) => {
      socket.to(`session:${bookingId}`).emit('clear_canvas');
    });

    socket.on('cursor_move', ({ bookingId, x, y }) => {
      socket.to(`session:${bookingId}`).emit('cursor_move', { userId: socket.userId, x, y });
    });

    socket.on('notes_update', ({ bookingId, notes }) => {
      console.log(`📝 Notes Sync: Session ${bookingId}`);
      socket.to(`session:${bookingId}`).emit('notes_update', { notes });
    });

    socket.on('chat_message', async ({ bookingId, message }) => {
      console.log(`💬 Chat: Session ${bookingId} | User ${socket.userId}: ${message}`);
      try {
        const { Message, User } = require('../models');
        const user = await User.findByPk(socket.userId, { attributes: ['name'] });
        
        const savedMsg = await Message.create({
          sender_id: socket.userId,
          booking_id: parseInt(bookingId),
          content: message,
        });

        console.log(`📤 Broadcasting message to room: session:${bookingId}`);
        wbNamespace.to(`session:${bookingId}`).emit('chat_message', {
          userId: socket.userId,
          senderName: user?.name || 'User',
          message,
          time: savedMsg.created_at || new Date().toISOString(),
        });
      } catch (err) {
        console.error('❌ Socket chat persistence error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Whiteboard disconnected: user ${socket.userId}`);
    });
  });
};
