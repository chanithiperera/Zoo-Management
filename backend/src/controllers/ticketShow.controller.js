const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Ticket = require('../models/Ticket.model');

// GET /api/ticket-show
exports.getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: tickets.length, data: tickets });
});

// GET /api/ticket-show/:id
exports.getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new AppError('Ticket not found', 404);
  res.status(200).json({ success: true, data: ticket });
});

// POST /api/ticket-show
exports.createTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.create(req.body);
  res.status(201).json({ success: true, data: ticket });
});

// PUT /api/ticket-show/:id
exports.updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!ticket) throw new AppError('Ticket not found', 404);
  res.status(200).json({ success: true, data: ticket });
});

// DELETE /api/ticket-show/:id
exports.deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndDelete(req.params.id);
  if (!ticket) throw new AppError('Ticket not found', 404);
  res.status(200).json({ success: true, data: {} });
});
