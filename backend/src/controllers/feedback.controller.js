const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Feedback = require('../models/Feedback.model');

// GET /api/feedback
exports.getAllFeedback = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  const feedback = await Feedback.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: feedback.length, data: feedback });
});

// GET /api/feedback/:id
exports.getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) throw new AppError('Feedback not found', 404);
  res.status(200).json({ success: true, data: feedback });
});

// POST /api/feedback  (public — visitors submit)
exports.createFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create(req.body);
  res.status(201).json({ success: true, data: feedback });
});

// PATCH /api/feedback/:id/status  (admin only — update status + note)
exports.updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { $set: { status, adminNote: adminNote || '' } },
    { new: true, runValidators: true }
  );
  if (!feedback) throw new AppError('Feedback not found', 404);
  res.status(200).json({ success: true, data: feedback });
});

// DELETE /api/feedback/:id  (admin only)
exports.deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) throw new AppError('Feedback not found', 404);
  res.status(200).json({ success: true, data: {} });
});
