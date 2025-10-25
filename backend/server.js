require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1); // ✅ For Render/Netlify proxies

// ==========================
// 🧠 CONFIGURATION
// ==========================
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================
// 🛡 SECURITY MIDDLEWARE
// ==========================
app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// ==========================
// 🌍 ADVANCED CORS SETUP
// ==========================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ben-marketshop.vercel.app',
  'https://ben-market.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.includes('onrender.com')
      ) {
        callback(null, true);
      } else {
        console.warn(`🚫 Blocked CORS from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// ==========================
// 🧱 PARSERS & LOGGING
// ==========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ==========================
// 📦 DATABASE CONNECTION
// ==========================
(async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
})();

// ==========================
// 🛣 API ROUTES
// ==========================
app.use('/api/products', require('./Routes/product'));
app.use('/api/orders', require('./Routes/order'));
app.use('/api/upload', require('./Routes/upload'));
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/mpesa', require('./Routes/mpesa'));
app.use('/api/payment', require('./Routes/payment'));
app.use('/api/auth/refresh', require('./Routes/auth_refresh'));
app.use('/api/chats', require('./Routes/chat'));
app.use('/api/users', require('./Routes/user'));
app.use('/api', require('./Routes/clerkWebhook')); // Clerk webhook

// ==========================
// 💚 HEALTH & STATUS
// ==========================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    env: NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/ping', (req, res) => res.send('pong 🏓'));

// ==========================
// 🏠 ROOT ROUTE
// ==========================
app.get('/', (req, res) => {
  res.send(`Ben Market API is running in ${NODE_ENV} mode 🚀`);
});

// 🚫 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ⚠️ ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(`❗ [${req.method}] ${req.originalUrl} - ${err.message}`);
  res.status(500).json({
    success: false,
    message:
      NODE_ENV === 'development'
        ? err.message
        : 'Internal Server Error, please try again later.',
  });
});

// ==========================
// 🔌 SOCKET.IO SETUP
// ==========================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://ben-marketshop.vercel.app',
      'https://ben-market.netlify.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join chat room
  socket.on('joinChat', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their chat room`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      const { chatId, senderId, content, receiverId } = data;
      
      // Import models
      const Message = require('./Models/Message');
      const Chat = require('./Models/Chat');
      
      // Create and save message to database
      const message = new Message({
        chatId,
        senderId,
        content,
        messageType: 'text'
      });
      
      await message.save();
      await message.populate('senderId', 'name email');
      
      // Update chat's last message
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: content,
        lastMessageTime: new Date()
      });
      
      // Emit to receiver
      socket.to(receiverId).emit('receiveMessage', {
        _id: message._id,
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        isRead: message.isRead,
        createdAt: message.createdAt,
        timestamp: message.createdAt
      });
      
      // Also emit to sender for confirmation
      socket.emit('messageSent', {
        _id: message._id,
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        isRead: message.isRead,
        createdAt: message.createdAt,
        timestamp: message.createdAt
      });
      
      console.log(`💬 Message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    socket.to(receiverId).emit('userTyping', {
      isTyping,
      senderId: socket.userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// ==========================
// 🚀 SERVER START
// ==========================
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔌 Socket.io server ready`);
});

process.on('SIGINT', () => {
  console.log('🛑 Server shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed. Bye!');
    process.exit(0);
  });
});
