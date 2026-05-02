<<<<<<< HEAD
module.exports = require('../middleware/validation.middleware');
=======
const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chains; returns 400 with field errors if invalid.
 */
const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.array(),
    });
  }
  next();
};

module.exports = validateRequest;
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
