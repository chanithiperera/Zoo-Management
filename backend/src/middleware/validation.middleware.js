const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Runs after express-validator chains and forwards normalized
 * validation errors to centralized error middleware.
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((entry) => ({
    field: entry.path || entry.param,
    message: entry.msg,
  }));

  const err = new AppError('Validation failed', 400);
  err.errors = errors;
  return next(err);
};

module.exports = validate;
