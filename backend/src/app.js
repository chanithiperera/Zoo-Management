const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

/** Parse comma-separated allowed origins; empty = allow all (handy for Expo / mobile) */
const parseOrigins = () =>
  (process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const isLoopbackOrigin = (origin) => {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
};

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, callback) {
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      // Allow local web dev clients even when NODE_ENV=production in ad-hoc tunnel setups.
      if (isLoopbackOrigin(origin)) {
        return callback(null, true);
      }
      const list = parseOrigins();
      if (list.length === 0) return callback(null, true);
      if (!origin) return callback(null, true);
      if (list.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const methodOverride = require('./middleware/methodOverride.middleware');
app.use(methodOverride);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/** Static files for uploaded media (Phase 2) */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
