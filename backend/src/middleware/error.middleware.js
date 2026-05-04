const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors;

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  }

  // Invalid Mongo ObjectId cast
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'id'}: ${err.value}`;
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = errors.map((e) => e.message).join(', ');
  }

  // JWT errors from other code paths
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Body parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload';
  }

  // Multer errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message || 'File upload error';
  }

  if (process.env.NODE_ENV !== 'production' && !(err instanceof AppError)) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && err.stack && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
