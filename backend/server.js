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
const winston = require('winston');
const client = require('prom-client');
const User = require('./Models/User');

const app = express();
app.set('trust proxy', 1);
// ==========================
// 📝 LOGGER (Winston)
// ==========================
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
  ),
  transports: [new winston.transports.Console()],
});


const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================
// 🛡 SECURITY & PERFORMANCE
// ==========================
app.use(helmet());
// Content Security Policy for production
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://*.clerk.com"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
    "connect-src": ["'self'", "https://*.clerk.com", "wss:", "https:", "http:"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "frame-src": ["'self'", "https://*.clerk.com"],
  }
}));
app.use(compression());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests, please try again later.',
  })
);

// Tighter limits on sensitive endpoints
app.use(['/api/upload', '/api/payment', '/api/auth'], rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
}));

// ==========================
// 🌍 CORS CONFIG
// ==========================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ben-marketshop.vercel.app',
  'https://ben-market.netlify.app',
  'https://ben-market-shop.onrender.com',
  'https://ben-marketshop-ijn3wow1c-skinny-kes-projects.vercel.app',
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (origin || '').includes('onrender.com') ||
        (origin || '').includes('vercel.app') ||
        (origin || '').includes('cloudflare.app')
      ) return cb(null, true);
      console.warn(`🚫 Blocked CORS from ${origin}`);
      cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Clerk-Auth-Token',
      'Origin',
      'Accept',
    ],
    credentials: true,
  })
);

console.log('✅ CORS enabled for:', allowedOrigins);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ==========================
// 📄 STATIC FILES (manifest.json must be public, bypass any auth)
// ==========================
app.use(express.static('public'));

// ==========================
// 📈 METRICS (Prometheus)
// ==========================
client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (e) {
    res.status(500).end(e.message);
  }
});

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
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Clerk-Auth-Token',
      'Origin',
      'Accept',
    ],
  },
});

// Expose io for controllers to emit events
app.set('io', io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers['clerk-auth-token'] || socket.handshake.headers['authorization']?.replace('Bearer ', '');
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

  // Join personal room and admin room if applicable
  if (socket.userId) {
    socket.join(socket.userId);
  }
  // Admin room join by checking DB role
  (async () => {
    try {
      if (!socket.userId) return;
      const dbUser = await User.findOne({ clerkId: socket.userId }).select('role');
      if (dbUser && dbUser.role === 'admin') {
        socket.join('admins');
        console.log(`👑 Admin joined admin room: ${socket.userId}`);
      }
    } catch (_) {}
  })();

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

