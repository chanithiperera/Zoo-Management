const mongoose = require('mongoose');

/** Mongoose readyState 1 = connected */
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Respond with 503 if MongoDB is not connected (clearer than a generic proxy error).
 */
function requireDatabase(req, res, next) {
  if (isDbConnected()) {
    return next();
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[db] Auth request blocked: mongoose readyState=${mongoose.connection.readyState} (1=connected).`
    );
  }
  res.status(503).json({
    success: false,
    code: 'DB_NOT_CONNECTED',
    message:
      'MongoDB is not connected on this API process. Check MONGODB_URI, Atlas IP allowlist, or local Mongo. GET /api/health shows dbConnected.',
  });
}

module.exports = { requireDatabase, isDbConnected };
