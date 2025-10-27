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
app.set('trust proxy', 1); // ✅ Needed for Render/Cloudflare proxies

// ==========================
// ⚙️ CONFIG
// ==========================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================
// 🛡 SECURITY MIDDLEWARE
// ==========================
app.use(helmet());
app.use(compression());

// Limit repeated requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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
// ⚡ CLERK WEBHOOK ROUTE (before body parser)
// ==========================
app.use('/api/clerk/webhook', require('./Routes/clerkWebhook')); // must come BEFORE express.json()

// ==========================
// 🧱 PARSERS & LOGGING
// ==========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'dev'));

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
app.use('/api/admin', require('./Routes/admin'));

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

app.get('/', (req, res) => {
  res.send(`Ben Market API running in ${NODE_ENV} mode 🚀`);
});

// 🚫 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ⚠️ ERROR HANDLER
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
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      socket.userId = decoded?.sub || decoded?.userId;
      console.log(`✅ Socket authenticated for user: ${socket.userId}`);
    } catch (err) {
      console.warn('⚠️ Socket auth warning:', err.message);
    }
  }
  next();
});

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  socket.emit('connected', { message: 'Connected to server' });

  socket.on('joinChat', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their chat room`);
    socket.emit('joinedRoom', { room: userId });
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { chatId, senderId, content, receiverId } = data;
      const Message = require('./Models/Message');
      const Chat = require('./Models/Chat');

      const message = await Message.create({
        chatId,
        senderId,
        content,
        messageType: 'text',
      });
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: content,
        lastMessageTime: new Date(),
      });

      io.to(receiverId).emit('receiveMessage', message);
      socket.emit('messageSent', message);

      console.log(`💬 Message sent from ${senderId} to ${receiverId}`);
    } catch (err) {
      console.error('❌ Error sending message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', (data) => {
    io.to(data.receiverId).emit('userTyping', {
      isTyping: data.isTyping,
      senderId: socket.userId,
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// ==========================
// 🚀 START SERVER
// ==========================
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔌 Socket.io active`);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});
