const express = require('express');
const orderController = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All order routes require authentication

router.post('/', orderController.createOrder); // Create order (Customer)
router.get('/mine', orderController.getMyOrders); // Get my orders (Customer)
router.patch('/:id/cancel', orderController.cancelOrder); // Cancel order (Customer)

// Admin only routes
router.get('/', restrictTo('admin'), orderController.getAllOrders);
router.get('/:id', restrictTo('admin'), orderController.getOrderById);
router.patch('/:id/status', restrictTo('admin'), orderController.updateOrderStatus);
router.delete('/:id', restrictTo('admin'), orderController.deleteOrder);

module.exports = router;
