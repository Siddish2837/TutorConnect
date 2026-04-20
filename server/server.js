require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const tutorRoutes = require('./routes/tutors');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');

// Socket handlers
const chatSocket = require('./sockets/chat');
const whiteboardSocket = require('./sockets/whiteboard');

// Scheduler
require('./services/scheduler');

const app = express();
const server = http.createServer(app);

// Socket.io
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io handlers
chatSocket(io);
whiteboardSocket(io);

// Global error handler
app.use(errorHandler);

// DB sync & server start
const PORT = process.env.PORT || 5000;

db.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io ready`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = { app, io };
