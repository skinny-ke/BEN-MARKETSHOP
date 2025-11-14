/**
 * server.js
 * All-in-one updated server file:
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
const { verifyClerkToken } = require('./middleware/clerkAuth'); // existing helper
const winston = require('winston');
const client = require('prom-client');
const User = require('./Models/User');
const Chat = require('./Models/Chat'); // ensure exists
const Message = require('./Models/Message'); // ensure exists

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
// CORS
// -----------------
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean).length
  ? (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://ben-marketshop.vercel.app',
      'https://ben-market-shop.onrender.com',
    ];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow server-to-server / curl
      if (allowedOrigins.includes(origin) || origin.includes('.vercel.app') || origin.includes('.onrender.com') || origin.includes('.netlify.app')) {
        return cb(null, true);
      }
      logger.warn(`🚫 Blocked CORS from ${origin}`);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Clerk-Auth-Token', 'Origin', 'Accept'],
    credentials: true,
  })
);

logger.info(`✅ CORS allowedOrigins: ${allowedOrigins.join(', ')}`);

// -----------------
// Clerk webhook should be BEFORE body parser if you verify raw body (already in your code base)
// -----------------
if (fsExistsSync(path.join(__dirname, 'Routes', 'clerkWebhook.js'))) {
  const clerkWebhook = require('./Routes/clerkWebhook.js');
  app.use('/api/clerk', clerkWebhook);
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan(process.env.MORGAN_FORMAT || 'dev'));

// Static
app.use(express.static('public'));

// Prometheus metrics
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
// Routes: keep existing order
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
app.use('/api/wishlist', require('./Routes/wishlist')); // ensure route exists
app.use('/api/reviews', require('./Routes/review'));
app.use('/api/inventory', require('./Routes/inventory'));
app.use('/api/email', require('./Routes/email'));
app.use('/api/notifications', require('./Routes/notifications'));
app.use('/api/loyalty', require('./Routes/loyalty'));

app.get('/health', (req, res) => res.json({ status: 'OK', env: NODE_ENV, uptime: process.uptime() }));
app.get('/', (req, res) => res.send(`Ben Market API running in ${NODE_ENV} mode 🚀`));

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

// -----------------
// Helper: synchronous fs exists
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
// Socket.IO + Auth + Persistence + Admin metrics
// -----------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Clerk-Auth-Token', 'Origin', 'Accept'],
  },
  path: '/socket.io',
  pingTimeout: 30000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
});

app.set('io', io);

// Track active users: map clerkId -> { sockets: Set, lastSeen }
const activeUsers = new Map();
// Track simple message rate-limiter per socket.id
const messageCounters = new Map();

const THROTTLE_WINDOW_MS = 10000; // 10s
const MAX_MESSAGES_PER_WINDOW = process.env.SOCKET_MAX_MSGS ? Number(process.env.SOCKET_MAX_MSGS) : 10;

// Socket auth middleware - using Clerk's official verification
io.use(async (socket, next) => {
  try {
    // Prefer auth token in handshake.auth (recommended) then headers
    const authToken = socket.handshake.auth?.token
      || socket.handshake.headers['clerk-auth-token']
      || socket.handshake.headers['authorization']?.replace('Bearer ', '')
      || socket.handshake.headers['authorization'];

    if (!authToken) {
      logger.warn('⚠️ Socket auth: missing token');
      return next(new Error('Unauthorized'));
    }

    // Use Clerk's official token verification
    const { verifyToken } = require('@clerk/backend');
    const payload = await verifyToken(authToken, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerkId = payload.sub;

    if (!clerkId) {
      logger.warn('⚠️ Socket auth: invalid token payload');
      return next(new Error('Unauthorized'));
    }

    socket.clerkId = clerkId;
    socket.token = authToken;
    return next();
  } catch (err) {
    logger.warn(`⚠️ Socket auth failed: ${err.message}`);
    return next(new Error('Unauthorized'));
  }
});

// Utility to add active user
function addActiveUser(clerkId, socketId) {
  const info = activeUsers.get(clerkId) || { sockets: new Set(), lastSeen: new Date() };
  info.sockets.add(socketId);
  info.lastSeen = new Date();
  activeUsers.set(clerkId, info);
  // notify admins
  io.to('admins').emit('active_users', { count: activeUsers.size, users: Array.from(activeUsers.keys()) });
}

// Utility to remove active user
function removeActiveUser(clerkId, socketId) {
  const info = activeUsers.get(clerkId);
  if (!info) return;
  info.sockets.delete(socketId);
  if (info.sockets.size === 0) {
    activeUsers.delete(clerkId);
  } else {
    activeUsers.set(clerkId, info);
  }
  io.to('admins').emit('active_users', { count: activeUsers.size, users: Array.from(activeUsers.keys()) });
}

// Socket connection
io.on('connection', async (socket) => {
  try {
    const clerkId = socket.clerkId || null;
    logger.info(`🟢 Socket connected: id=${socket.id} clerkId=${clerkId || 'anon'}`);

    // join personal room
    if (clerkId) {
      socket.join(clerkId);
      addActiveUser(clerkId, socket.id);
    }

    // check DB for admin role, add to admins room if admin
    if (clerkId) {
      try {
        const dbUser = await User.findOne({ clerkId }).select('role email');
        if (dbUser && dbUser.role === 'admin') {
          socket.join('admins');
          logger.info(`👑 Admin connected: ${dbUser.email || clerkId}`);
        }
      } catch (err) {
        logger.warn('⚠️ Error checking admin role:', err.message);
      }
    }

    // init message counter for throttle
    messageCounters.set(socket.id, { count: 0, ts: Date.now() });

    // handle room joins
    socket.on('joinChat', (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
      logger.info(`👤 Socket ${socket.id} joined chat ${chatId}`);
    });

    // handle typing events (broadcast to chat)
    socket.on('typing', (data) => {
      try {
        const { receiverId, isTyping, senderId } = data;
        if (receiverId) {
          socket.to(receiverId).emit('userTyping', { senderId: senderId || socket.clerkId, isTyping });
        }
      } catch (err) {
        logger.warn('⚠️ typing handler error:', err.message);
      }
    });

    // handle sendMessage with persistence + basic throttle
    socket.on('sendMessage', async (data) => {
      try {
        // throttle
        const counter = messageCounters.get(socket.id) || { count: 0, ts: Date.now() };
        const now = Date.now();
        if (now - counter.ts < THROTTLE_WINDOW_MS) {
          counter.count += 1;
        } else {
          counter.count = 1;
          counter.ts = now;
        }
        messageCounters.set(socket.id, counter);

        if (counter.count > MAX_MESSAGES_PER_WINDOW) {
          socket.emit('rate_limited', { message: 'Too many messages. Slow down.' });
          return;
        }

        const { chatId, content, messageType = 'text', metadata = {} } = data;
        const senderId = socket.clerkId;

        if (!chatId || !senderId || !content) {
          socket.emit('send_error', { message: 'Invalid message data' });
          return;
        }

        // Save message to DB (optional)
        let savedMessage = null;
        try {
          const messageDoc = new Message({
            chatId,
            senderId,
            content,
            messageType,
            metadata,
            isRead: false,
          });
          savedMessage = await messageDoc.save();
        } catch (err) {
          logger.warn('⚠️ Failed to persist message:', err.message);
        }

        const emitPayload = {
          _id: savedMessage?._id || null,
          chatId,
          content,
          senderId,
          messageType,
          metadata,
          createdAt: savedMessage?.createdAt || new Date(),
        };

        io.to(chatId).emit('receiveMessage', emitPayload);
        logger.info(`💬 Message from ${senderId} in chat ${chatId}`);
      } catch (err) {
        logger.error('❌ sendMessage handler failed:', err.message);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`🔴 Socket disconnected: id=${socket.id} reason=${reason}`);
      if (socket.clerkId) removeActiveUser(socket.clerkId, socket.id);
      messageCounters.delete(socket.id);
    });
  } catch (outerErr) {
    logger.error('❌ Socket connection error:', outerErr.message);
  }
});

// Health broadcast every 60s
setInterval(() => {
  try {
    io.emit('server_status', {
      uptime: process.uptime(),
      users: io.engine.clientsCount || 0,
      activeUsers: Array.from(activeUsers.keys()).length,
    });
  } catch (e) {
    logger.warn('⚠️ server_status emit failed:', e.message);
  }
}, 60000);

// Simple admin route to list connected users (protected by simple token or Clerk admin role check)
// NOTE: you can add Clerk auth middleware here; this is a lightweight endpoint for admins
app.get('/admin/connected', async (req, res) => {
  try {
    // Basic header token guard (optional)
    const adminKey = process.env.ADMIN_API_KEY;
    if (adminKey && req.headers['x-admin-key'] !== adminKey) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = Array.from(activeUsers.entries()).map(([clerkId, info]) => ({
      clerkId,
      socketCount: info.sockets.size,
      lastSeen: info.lastSeen,
    }));

    return res.json({ count: activeUsers.size, users });
  } catch (err) {
    logger.warn('⚠️ admin/connected error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

// -----------------
// Start server
// -----------------
server.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
});

process.on('SIGINT', () => {
  logger.info('🛑 Graceful shutdown...');
  server.close(() => process.exit(0));
});
