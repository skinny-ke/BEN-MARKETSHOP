// backend/app.js - exports express app for testing
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

// Connect DB only when not in test to avoid side-effects if desired
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Routes
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/products', require('./Routes/product'));
app.use('/api/orders', require('./Routes/order'));
app.use('/api/mpesa', require('./Routes/mpesa'));
app.use('/api/upload', require('./Routes/upload'));
app.use('/api/payment', require('./Routes/payment'));
app.use('/api/auth/refresh', require('./Routes/auth_refresh'));

app.get('/', (req, res) => res.send('MERN Shop Server - app.js'));

module.exports = app;
