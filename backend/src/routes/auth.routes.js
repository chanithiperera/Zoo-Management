const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
} = require('../validations/auth.validation');
const validateRequest = require('../validations/validateRequest');

const router = express.Router();

router.post('/register', requireDatabase, registerRules, validateRequest, authController.register);
router.post('/login', requireDatabase, loginRules, validateRequest, authController.login);
router.get('/me', requireDatabase, protect, authController.getMe);
router.patch('/me', requireDatabase, protect, updateProfileRules, validateRequest, authController.updateMe);
router.patch(
  '/me/password',
  requireDatabase,
  protect,
  changePasswordRules,
  validateRequest,
  authController.changeMyPassword
);

module.exports = router;
