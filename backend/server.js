const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { startPriceAlertWorker, stopPriceAlertWorker } = require('./jobs/priceAlertCron');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
let server = null;

const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'SMTP_HOST'
];

const validateEnvironment = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key] || !String(process.env[key]).trim());

  if (process.env.SMTP_USER && !process.env.SMTP_PASS) {
    missing.push('SMTP_PASS');
  }

  if (process.env.SMTP_PASS && !process.env.SMTP_USER) {
    missing.push('SMTP_USER');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${[...new Set(missing)].join(', ')}`);
  }

  if (String(process.env.JWT_SECRET).length < 32) {
    console.warn('[startup] JWT_SECRET is shorter than 32 characters; use a longer random secret in production.');
  }
};

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/alerts', alertRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  validateEnvironment();
  await connectDB();

  const port = Number(process.env.PORT) || 5000;
  server = app.listen(port, () => {
    console.log(`[server] EKart API is listening on port ${port}`);
  });

  startPriceAlertWorker();
  console.log(`[worker] Price alert worker started with schedule: ${process.env.PRICE_ALERT_CRON || '0 * * * *'}`);

  return server;
};

const shutdown = async (signal) => {
  console.log(`[server] ${signal} received. Shutting down gracefully.`);
  stopPriceAlertWorker();

  const disconnect = async () => {
    try {
      await mongoose.disconnect();
      process.exit(0);
    } catch (error) {
      console.error(`[server] Shutdown error: ${error.message}`);
      process.exit(1);
    }
  };

  if (server) {
    server.close(() => {
      disconnect();
    });
  } else {
    await disconnect();
  }
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`[server] Failed to start: ${error.message}`);
    process.exit(1);
  });

  process.once('SIGTERM', () => {
    shutdown('SIGTERM');
  });

  process.once('SIGINT', () => {
    shutdown('SIGINT');
  });
}

module.exports = {
  app,
  startServer
};
