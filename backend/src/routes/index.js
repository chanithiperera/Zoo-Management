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
const educationRoutes = require('./education.routes');
const quizRoutes = require('./quiz.routes');
const lifeCycleRoutes = require('./lifecycle.routes');
const didYouKnowRoutes = require('./didyouknow.routes');
const photographyBookingRoutes = require('./photographyBooking.routes');
const photographerRoutes = require('./photographer.routes');
const photographyPackageRoutes = require('./photographyPackage.routes');
const photoRoutes = require('./photo.routes');
const timeSlotRoutes = require('./timeSlot.routes');
const visitorRoutes = require('./visitor.routes');
const feedingBookingRoutes = require('./feedingBooking.routes');
const encounterAnimalsRoutes = require('./encounterAnimals.routes');

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
router.use('/education', educationRoutes);
router.use('/quiz', quizRoutes);
router.use('/lifecycle', lifeCycleRoutes);
router.use('/didyouknow', didYouKnowRoutes);
router.use('/photography-bookings', photographyBookingRoutes);
router.use('/photographers', photographerRoutes);
router.use('/photography-packages', photographyPackageRoutes);
router.use('/photos', photoRoutes);
router.use('/time-slots', timeSlotRoutes);
router.use('/visitors', visitorRoutes);
router.use('/feeding-bookings', feedingBookingRoutes);
router.use('/encounter-animals', encounterAnimalsRoutes);

module.exports = router;
