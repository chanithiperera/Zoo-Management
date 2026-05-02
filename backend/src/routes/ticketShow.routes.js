const express = require('express');
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketShow.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');

const router = express.Router();

router.use(requireDatabase);

router
  .route('/')
  .get(getAllTickets)
  .post(protect, restrictTo('admin'), createTicket);

router
  .route('/:id')
  .get(getTicketById)
  .put(protect, restrictTo('admin'), updateTicket)
  .delete(protect, restrictTo('admin'), deleteTicket);

module.exports = router;
