const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const validateRequest = require('../validations/validateRequest');
const { createUserRules, updateUserRules, deleteUserRules } = require('../validations/admin.validation');

const router = express.Router();

router.use(requireDatabase, protect, restrictTo('admin'));

router.get('/users', adminController.listUsers);
router.post('/users', createUserRules, validateRequest, adminController.createUser);
router.patch('/users/:id', updateUserRules, validateRequest, adminController.updateUser);
router.delete('/users/:id', deleteUserRules, validateRequest, adminController.deleteUser);

module.exports = router;
