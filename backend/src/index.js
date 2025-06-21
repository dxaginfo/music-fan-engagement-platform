require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const queueRoutes = require('./routes/queue.routes');
const merchandiseRoutes = require('./routes/merchandise.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateJwt } = require('./middleware/auth');

// Import socket handlers
const { setupSocketHandlers } = require('./sockets');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup socket handlers
setupSocketHandlers(io);

// Apply middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateJwt, userRoutes);
app.use('/api/events', eventRoutes); // Some public routes
app.use('/api/registrations', authenticateJwt, registrationRoutes);
app.use('/api/queue', authenticateJwt, queueRoutes);
app.use('/api/merchandise', merchandiseRoutes); // Some public routes
app.use('/api/analytics', authenticateJwt, analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't crash the server in production
  // process.exit(1);
});

module.exports = { app, server }; // Export for testing