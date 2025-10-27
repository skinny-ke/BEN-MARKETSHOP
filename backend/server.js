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
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================
// 🛡 SECURITY & PERFORMANCE
// ==========================
app.use(helmet());
app.use(compression());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests, please try again later.',
  })
);

// ==========================
// 🌍 CORS CONFIG
// ==========================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ben-marketshop.vercel.app',
  'https://ben-market.netlify.app',
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes('onrender.com'))
        return cb(null, true);
      console.warn(`🚫 Blocked CORS from ${origin}`);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ==========================
// 📦 DATABASE
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
// 📡 ROUTES
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
app.use('/api/clerk', require('./Routes/clerkWebhook'));

app.get('/health', (req, res) =>
  res.json({ status: 'OK', env: NODE_ENV, uptime: process.uptime() })
);

app.get('/', (req, res) =>
  res.send(`Ben Market API running in ${NODE_ENV} mode 🚀`)
);

app.use('*', (req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(`❗ [${req.method}] ${req.originalUrl} - ${err.message}`);
  res.status(500).json({
    success: false,
    message:
      NODE_ENV === 'development' ? err.message : 'Internal Server Error, please try again later.',
  });
});

// ==========================
// 🔌 SOCKET.IO
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
      console.log(`✅ Socket authenticated for user ${socket.userId}`);
    } catch (e) {
      console.warn('⚠️ Invalid socket token');
    }
  }
  next();
});

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.emit('connected', { message: 'Connected to server' });

  socket.on('joinChat', (userId) => {
    socket.join(userId);
    socket.emit('joinedRoom', { room: userId });
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { chatId, senderId, content, receiverId } = data;
      const Message = require('./Models/Message');
      const Chat = require('./Models/Chat');

      const message = new Message({ chatId, senderId, content, messageType: 'text' });
      await message.save();
      await message.populate('senderId', 'name email');

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: content,
        lastMessageTime: new Date(),
      });

      io.to(receiverId).emit('receiveMessage', message);
      socket.emit('messageSent', message);
    } catch (err) {
      console.error('💥 Message error:', err);
      socket.emit('error', { message: 'Message send failed' });
    }
  });

  socket.on('disconnect', () => console.log(`❌ Disconnected: ${socket.id}`));
});

// ==========================
// 🚀 START SERVER
// ==========================
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('🛑 Graceful shutdown...');
  server.close(() => process.exit(0));
});
