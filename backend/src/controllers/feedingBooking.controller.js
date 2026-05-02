const asyncHandler = require('../utils/asyncHandler');
const feedingBookingService = require('../services/feedingBooking.service');

exports.createBooking = asyncHandler(async (req, res) => {
  const booking = await feedingBookingService.createBooking(req.body);

  res.status(201).json({
    success: true,
    message: 'Feeding booking created successfully',
    data: booking,
  });
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await feedingBookingService.getAllBookings(req.query);

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});
exports.updateBooking = asyncHandler(async (req, res) => {
  const booking = await feedingBookingService.updateBooking(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Feeding booking updated successfully',
    data: booking,
  });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  await feedingBookingService.deleteBooking(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Feeding booking deleted successfully',
  });
});
