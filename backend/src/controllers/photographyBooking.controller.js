const asyncHandler = require('../utils/asyncHandler');
const photographyBookingService = require('../services/photographyBooking.service');

exports.createBooking = asyncHandler(async (req, res) => {
  console.log('[PhotographyController] Creating booking with payload:', JSON.stringify(req.body, null, 2));
  const populatedBooking = await photographyBookingService.createBooking(req.body);

  res.status(201).json({
    success: true,
    message: 'Photography booking created successfully',
    bookingDetails: populatedBooking,
    data: populatedBooking,
  });
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await photographyBookingService.getAllBookings({
    date: req.query.date,
    visitor: req.query.visitor,
    photographer: req.query.photographer,
  });

  res.status(200).json({
    success: true,
    count: bookings.length,
    bookingDetails: bookings,
    data: bookings,
  });
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await photographyBookingService.getBookingById(req.params.id);

  res.status(200).json({
    success: true,
    bookingDetails: booking,
    data: booking,
  });
});

exports.updateBooking = asyncHandler(async (req, res) => {
  const updatedBooking = await photographyBookingService.updateBooking(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Photography booking updated successfully',
    bookingDetails: updatedBooking,
    data: updatedBooking,
  });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  console.log(`[PhotographyController] Deleting booking: ${req.params.id}`);
  await photographyBookingService.deleteBooking(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Photography booking deleted successfully',
  });
});
