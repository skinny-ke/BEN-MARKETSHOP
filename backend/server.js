/**
 * server.js
 * Updated server file:
 * - Supports multiple FRONTEND_URL variables
 * - Clerk + HTTP + Socket.IO auth
 * - Socket message persistence to MongoDB
 * - Admin metrics & socket tracking
 * - Improved CORS, security, logging
 */

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
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const winston = require('winston');
const client = require('prom-client');
const User = require('./Models/User');
const Message = require('./Models/Message');

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// -----------------
// Logger (winston)
// -----------------
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [new winston.transports.Console()],
});

// -----------------
// Security & Perf
// -----------------
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://*.clerk.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https:", "wss:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://*.clerk.com"],
    },
  })
);
app.use(compression());

// -----------------
// Rate limits
// -----------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests, please try again later.',
  })
);

app.use(
  ['/api/upload', '/api/payment', '/api/auth'],
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60,
  })
);

// -----------------
// CORS (supports multiple frontend URLs)
// -----------------
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ben-market-shop.onrender.com',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      const isAllowed = allowedOrigins.some(allowedOrigin => origin === allowedOrigin);

      const isPlatformAllowed = origin.includes('.vercel.app') ||
                                origin.includes('.onrender.com') ||
                                origin.includes('.netlify.app') ||
                                origin.includes('.railway.app') ||
                                origin.includes('.fly.app') ||
                                origin.includes('.herokuapp.com');

      if (isAllowed || isPlatformAllowed) {
        logger.info(`✅ CORS allowed from ${origin}`);
        return cb(null, true);
      }

      logger.warn(`🚫 Blocked CORS from ${origin}`);
      return cb(null, true); // Temporary: allow all for debugging
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Clerk-Auth-Token', 'Origin', 'Accept', 'x-client'],
    credentials: true,
    exposedHeaders: ['X-Total-Count'],
  })
);

logger.info(`✅ CORS allowedOrigins: ${allowedOrigins.join(', ')}`);

// -----------------
// Body parsers & static
// -----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.MORGAN_FORMAT || 'dev'));
app.use(express.static('public'));

// -----------------
// Prometheus metrics
// -----------------
client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (e) {
    res.status(500).end(e.message);
  }
});

// -----------------
// Connect DB
// -----------------
(async () => {
  try {
    await connectDB();
    logger.info('✅ MongoDB connected successfully');
  } catch (err) {
    logger.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
})();

// -----------------
// Routes
// -----------------
app.use('/api/products', require('./Routes/product'));
app.use('/api/orders', require('./Routes/order'));
app.use('/api/upload', require('./Routes/upload'));
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/mpesa', require('./Routes/mpesa'));
app.use('/api/payment', require('./Routes/payment'));
app.use('/api/chats', require('./Routes/chat'));
app.use('/api/users', require('./Routes/user'));
app.use('/api/admin', require('./Routes/admin'));
app.use('/api/tracking', require('./Routes/tracking'));
app.use('/api/analytics', require('./Routes/analytics'));
app.use('/api/wishlist', require('./Routes/wishlist'));
app.use('/api/reviews', require('./Routes/review'));
app.use('/api/inventory', require('./Routes/inventory'));
app.use('/api/email', require('./Routes/email'));
app.use('/api/notifications', require('./Routes/notifications'));
app.use('/api/loyalty', require('./Routes/loyalty'));
app.use('/api/csv', require('./Routes/csv'));

app.get('/health', (req, res) => res.json({ status: 'OK', env: NODE_ENV, uptime: process.uptime() }));
app.get('/', (req, res) => res.send(`Ben Market API running in ${NODE_ENV} mode 🚀`));
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

// -----------------
// Helper: fs exists
// -----------------
function fsExistsSync(p) {
  const fs = require('fs');
  try {
    return fs.existsSync(p);
  } catch (_) {
    return false;
  }
}

// -----------------
// Socket.IO
// -----------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Clerk-Auth-Token', 'Origin', 'Accept', 'x-client'],
  },
  path: '/socket.io',
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  cookie: false,
});

app.set('io', io);

const activeUsers = new Map();
const messageCounters = new Map();
const THROTTLE_WINDOW_MS = 10000;
const MAX_MESSAGES_PER_WINDOW = process.env.SOCKET_MAX_MSGS ? Number(process.env.SOCKET_MAX_MSGS) : 10;

io.use(async (socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token
      || socket.handshake.headers['clerk-auth-token']
      || socket.handshake.headers['authorization']?.replace('Bearer ', '')
      || socket.handshake.headers['authorization'];

    if (!authToken) return next(new Error('Unauthorized'));

    const { verifyToken } = require('@clerk/backend');
    const payload = await verifyToken(authToken, { secretKey: process.env.CLERK_SECRET_KEY });
    const clerkId = payload.sub;
    if (!clerkId) return next(new Error('Unauthorized'));

    socket.clerkId = clerkId;
    socket.token = authToken;
    next();
  } catch (err) {
    logger.warn(`⚠️ Socket auth failed: ${err.message}`);
    next(new Error('Unauthorized'));
  }
});

function addActiveUser(clerkId, socketId) {
  const info = activeUsers.get(clerkId) || { sockets: new Set(), lastSeen: new Date() };
  info.sockets.add(socketId);
  info.lastSeen = new Date();
  activeUsers.set(clerkId, info);
  io.to('admins').emit('active_users', { count: activeUsers.size, users: Array.from(activeUsers.keys()) });
}

function removeActiveUser(clerkId, socketId) {
  const info = activeUsers.get(clerkId);
  if (!info) return;
  info.sockets.delete(socketId);
  if (info.sockets.size === 0) activeUsers.delete(clerkId);
  else activeUsers.set(clerkId, info);
  io.to('admins').emit('active_users', { count: activeUsers.size, users: Array.from(activeUsers.keys()) });
}

io.on('connection', async (socket) => {
  const clerkId = socket.clerkId || null;
  logger.info(`🟢 Socket connected: id=${socket.id} clerkId=${clerkId || 'anon'}`);
  if (clerkId) {
    socket.join(clerkId);
    addActiveUser(clerkId, socket.id);

    try {
      const dbUser = await User.findOne({ clerkId }).select('role email');
      if (dbUser?.role === 'admin') socket.join('admins');
    } catch {}
  }

  messageCounters.set(socket.id, { count: 0, ts: Date.now() });

  socket.on('joinChat', (chatId) => { if (chatId) socket.join(chatId); });

  socket.on('typing', (data) => {
    const { receiverId, isTyping, senderId } = data;
    if (receiverId) socket.to(receiverId).emit('userTyping', { senderId: senderId || socket.clerkId, isTyping });
  });

  socket.on('sendMessage', async (data) => {
    const counter = messageCounters.get(socket.id) || { count: 0, ts: Date.now() };
    const now = Date.now();
    if (now - counter.ts < THROTTLE_WINDOW_MS) counter.count += 1;
    else { counter.count = 1; counter.ts = now; }
    messageCounters.set(socket.id, counter);

    if (counter.count > MAX_MESSAGES_PER_WINDOW) return socket.emit('rate_limited', { message: 'Too many messages. Slow down.' });

    const { chatId, content, messageType = 'text', metadata = {} } = data;
    const senderId = socket.clerkId;
    if (!chatId || !senderId || !content) return socket.emit('send_error', { message: 'Invalid message data' });

    let savedMessage = null;
    try {
      savedMessage = await new Message({ chatId, senderId, content, messageType, metadata, isRead: false }).save();
    } catch {}

    io.to(chatId).emit('receiveMessage', {
      _id: savedMessage?._id || null,
      chatId, content, senderId, messageType, metadata,
      createdAt: savedMessage?.createdAt || new Date()
    });
  });

  socket.on('disconnect', (reason) => {
    logger.info(`🔴 Socket disconnected: id=${socket.id} reason=${reason}`);
    if (socket.clerkId) removeActiveUser(socket.clerkId, socket.id);
    messageCounters.delete(socket.id);
  });
});

setInterval(() => {
  io.emit('server_status', {
    uptime: process.uptime(),
    users: io.engine.clientsCount || 0,
    activeUsers: activeUsers.size,
  });
}, 60000);

app.get('/admin/connected', (req, res) => {
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey && req.headers['x-admin-key'] !== adminKey) return res.status(403).json({ message: 'Forbidden' });

  const users = Array.from(activeUsers.entries()).map(([clerkId, info]) => ({
    clerkId,
    socketCount: info.sockets.size,
    lastSeen: info.lastSeen,
  }));
  return res.json({ count: activeUsers.size, users });
});

server.listen(PORT, () => logger.info(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`));

process.on('SIGINT', () => {
  logger.info('🛑 Graceful shutdown...');
  server.close(() => process.exit(0));
});
