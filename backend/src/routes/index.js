<<<<<<< HEAD
=======
<<<<<<< HEAD
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./auth.routes');
const ticketShowRoutes = require('./ticketShow.routes');
const eventsRoutes = require('./events.routes');
const feedbackRoutes = require('./feedback.routes');
const animalsRoutes = require('./animals.routes');
const encountersRoutes = require('./encounters.routes');
const storeRoutes = require('./store.routes');
const adminRoutes = require('./admin.routes');
const photographyBookingRoutes = require('./photographyBooking.routes');
const photographerRoutes = require('./photographer.routes');
const photographyPackageRoutes = require('./photographyPackage.routes');
const photoRoutes = require('./photo.routes');
const timeSlotRoutes = require('./timeSlot.routes');
const visitorRoutes = require('./visitor.routes');
const feedingBookingRoutes = require('./feedingBooking.routes');

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
router.use('/admin', adminRoutes);
router.use('/photography-bookings', photographyBookingRoutes);
router.use('/photographers', photographerRoutes);
router.use('/photography-packages', photographyPackageRoutes);
router.use('/photos', photoRoutes);
router.use('/time-slots', timeSlotRoutes);
router.use('/visitors', visitorRoutes);
router.use('/feeding-bookings', feedingBookingRoutes);

module.exports = router;
=======
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./auth.routes');
const ticketShowRoutes = require('./ticketShow.routes');
const eventsRoutes = require('./events.routes');
const feedbackRoutes = require('./feedback.routes');
const animalsRoutes = require('./animals.routes');
const encountersRoutes = require('./encounters.routes');
const storeRoutes = require('./store.routes');
<<<<<<< HEAD
=======
const orderRoutes = require('./order.routes');
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
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
<<<<<<< HEAD
router.use('/admin', adminRoutes);

module.exports = router;
=======
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035
