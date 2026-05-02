const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./auth.routes');
const ticketShowRoutes = require('./ticketShow.routes');
const eventsRoutes = require('./events.routes');
const feedbackRoutes = require('./feedback.routes');
const animalsRoutes = require('./animals.routes');
const encountersRoutes = require('./encounters.routes');
const storeRoutes = require('./store.routes');
const orderRoutes = require('./order.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const payload = {
    success: dbConnected,
    message: dbConnected
      ? 'Zoo Management API is running'
      : 'API is running but MongoDB is not connected',
    dbConnected,
  };
  res.status(dbConnected ? 200 : 503).json(payload);
});

router.use('/auth', authRoutes);
router.use('/ticket-show', ticketShowRoutes);
router.use('/events', eventsRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/animals', animalsRoutes);
router.use('/encounters', encountersRoutes);
router.use('/store', storeRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
