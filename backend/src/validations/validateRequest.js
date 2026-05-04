<<<<<<< HEAD
=======
<<<<<<< HEAD
module.exports = require('../middleware/validation.middleware');
=======
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
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
<<<<<<< HEAD
=======
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
