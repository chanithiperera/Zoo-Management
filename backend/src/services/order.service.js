const mongoose = require('mongoose');
const Order = require('../models/Order.model');
const storeService = require('./store.service');
const AppError = require('../utils/AppError');

const createOrder = async (userId, orderData) => {
  const { items, shippingAddress, totalAmount } = orderData;

  // 1. Validate items and update stock
  for (const item of items) {
    await storeService.updateStock(item.product, -item.quantity, item.size);
  }

  // 2. Create the order
  const order = await Order.create({
    user: userId,
    items,
    shippingAddress,
    totalAmount,
    paymentStatus: 'paid',
    orderStatus: 'pending',
  });

  return order;
};

const getMyOrders = async (userId) => {
  return await Order.find({ user: userId }).populate('items.product').sort({ createdAt: -1 });
};

const getAllOrders = async () => {
  return await Order.find().populate('user', 'fullName email').populate('items.product').sort({ createdAt: -1 });
};

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  if (order.orderStatus === 'cancelled') {
    throw new Error('Cannot update status of a cancelled order');
  }

  order.orderStatus = status;
  return await order.save();
};

const getOrderById = async (id) => {
  return await Order.findById(id).populate('user', 'fullName email').populate('items.product');
};

const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new Error('Order not found');

  if (order.orderStatus !== 'pending') {
    throw new Error('Order cannot be cancelled as it is already being processed');
  }

  // Restore stock
  for (const item of order.items) {
    await storeService.updateStock(item.product, item.quantity, item.size);
  }

  order.orderStatus = 'cancelled';
  return await order.save();
};

const deleteOrder = async (orderId) => {
  if (!orderId || !mongoose.Types.ObjectId.isValid(String(orderId))) {
    throw new AppError('Invalid order ID', 400);
  }
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled') {
    throw new AppError('Only delivered or cancelled orders can be deleted', 403);
  }

  const deleted = await Order.findByIdAndDelete(orderId);
  return deleted;
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
  deleteOrder,
};
