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
const { verifyClerkToken } = require('./middleware/clerkAuth');

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
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  'http://localhost:5173',
  'https://ben-marketshop.vercel.app',
  'https://ben-marketshop-ijn3wow1c-skinny-kes-projects.vercel.app',
  FRONTEND_URL,
];

const corsOptions = {
  origin: (origin, cb) => {
    const isAllowed =
      !origin ||
      allowedOrigins.includes(origin) ||
      (new URL(origin).hostname || '').includes('onrender.com') ||
      (new URL(origin).hostname || '').includes('cloudflare.app');

    if (isAllowed) return cb(null, true);

    console.warn(`\x1b[31m🚫 Blocked CORS\x1b[0m from ${origin}`);
    return cb(null, false); // do not crash server
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Clerk-Auth-Token',
    'Origin',
    'Accept',
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ==========================
// 📄 STATIC FILES (manifest.json must be public, bypass any auth)
// ==========================
app.use(express.static(path.join(__dirname, 'public')));

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
app.use('/api/tracking', require('./Routes/tracking'));
app.use('/api/analytics', require('./Routes/analytics'));

app.get('/health', (req, res) =>
  res.json({ status: 'OK', env: NODE_ENV, uptime: process.uptime() })
);

app.get('/', (req, res) =>
  res.send(`Ben Market API running in ${NODE_ENV} mode 🚀`)
);

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Use global error handler
app.use(errorHandler);

// ==========================
// 🔌 SOCKET.IO
// ==========================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: true,
    allowedHeaders: corsOptions.allowedHeaders,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.replace('Bearer ', '');
    if (!token) {
      console.warn('\x1b[33m⚠️ Socket missing token\x1b[0m');
      return next(new Error('Unauthorized'));
    }
    const decoded = await verifyClerkToken(token);
    socket.userId = decoded?.sub || decoded?.userId || null;
    if (!socket.userId) {
      console.warn('\x1b[33m⚠️ Socket token verified but no user id\x1b[0m');
      return next(new Error('Unauthorized'));
    }
    console.log(`\x1b[32m✅ Socket authenticated\x1b[0m user=${socket.userId}`);
    return next();
  } catch (e) {
    console.warn(`\x1b[31m⚠️ Socket auth failed\x1b[0m: ${e.message}`);
    try {
      socket.emit('auth_error', { message: 'Authentication failed. Disconnecting.' });
      socket.disconnect(true);
    } catch (_) {}
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log(`\x1b[36m🟢 Socket connected\x1b[0m id=${socket.id} user=${socket.userId || 'anon'}`);

  // Join room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`\x1b[34m👤 Joined room\x1b[0m socket=${socket.id} room=${roomId}`);
  });

  // Send message
  socket.on('send_message', (data) => {
    const { roomId, message, senderId, senderName } = data;
    
    io.to(roomId).emit('receive_message', {
      message,
      senderId,
      senderName,
      timestamp: new Date(),
      roomId
    });
    
    console.log(`\x1b[35m💬 Message\x1b[0m room=${roomId} from=${senderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`\x1b[90m🔴 Socket disconnected\x1b[0m id=${socket.id}`);
  });
});

// Health monitoring broadcast every 60s
setInterval(() => {
  try {
    io.emit('server_status', {
      uptime: process.uptime(),
      users: io.engine.clientsCount,
    });
  } catch (_) {}
}, 60 * 1000);

// ==========================
// 🚀 START SERVER
// ==========================
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
});

process.on('SIGINT', () => {
  console.log('🛑 Graceful shutdown...');
  server.close(() => process.exit(0));
});

