const Order = require('../models/Order.model');
const storeService = require('./store.service');

const createOrder = async (userId, orderData) => {
  const { items, shippingAddress, totalAmount } = orderData;
  
  // 1. Validate items and update stock
  for (const item of items) {
    await storeService.updateStock(item.product, -item.quantity);
  }
  
  // 2. Create the order
  const order = await Order.create({
    user: userId,
    items,
    shippingAddress,
    totalAmount,
    paymentStatus: 'paid', // Assuming payment is successful for now (mock)
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
  return await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
};

const getOrderById = async (id) => {
  return await Order.findById(id).populate('user', 'fullName email').populate('items.product');
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
};
