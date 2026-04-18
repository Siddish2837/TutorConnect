const jwt = require('jsonwebtoken');

module.exports = (io) => {
  const wbNamespace = io.of('/whiteboard');

  wbNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Auth required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  wbNamespace.on('connection', (socket) => {
    console.log(`Whiteboard connected: user ${socket.userId}`);

    socket.on('join_session', ({ bookingId }) => {
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

    socket.on('chat_message', ({ bookingId, message }) => {
      wbNamespace.to(`session:${bookingId}`).emit('chat_message', {
        userId: socket.userId, message, time: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Whiteboard disconnected: user ${socket.userId}`);
    });
  });
};
