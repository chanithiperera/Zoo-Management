const path = require('path');
const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Feedback = require('../models/Feedback.model');
const Inquiry = require('../models/Inquiry.model');
const Review = require('../models/Review.model');

// --- FEEDBACK ---

exports.createFeedback = asyncHandler(async (req, res) => {
  const { type, subject, message } = req.body;

  if (!type || !subject || !message) {
    throw new AppError('Type, subject, and message are required', 400);
  }

  const feedback = await Feedback.create({
    userId: req.user._id,
    type,
    subject,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
    data: { feedback },
  });
});

exports.getMyFeedbacks = asyncHandler(async (req, res, next) => {
  const feedbacks = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'My feedbacks loaded',
    data: { feedbacks },
  });
});

exports.updateFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { type: req.body.type, subject: req.body.subject, message: req.body.message },
    { new: true, runValidators: true }
  );

  if (!feedback) return next(new AppError('No feedback found with that ID or you do not have permission', 404));

  res.status(200).json({ success: true, data: { feedback } });
});

exports.deleteFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!feedback) return next(new AppError('No feedback found with that ID or you do not have permission', 404));

  res.status(204).json({ success: true, data: null });
});

exports.getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find().populate('userId', 'fullName email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'All feedbacks loaded (Admin)',
    data: { feedbacks },
  });
});

// --- INQUIRIES ---

exports.createInquiry = asyncHandler(async (req, res, next) => {
  const { type, subject, message } = req.body;
  const imageUrl = req.file ? `/uploads/feedback/${req.file.filename}` : undefined;

  if (!type || !subject || !message) {
    throw new AppError('Type, subject, and message are required', 400);
  }

  const inquiry = await Inquiry.create({
    userId: req.user._id,
    type,
    subject,
    message,
    imageUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Inquiry submitted successfully',
    data: { inquiry },
  });
});

exports.getMyInquiries = asyncHandler(async (req, res, next) => {
  const inquiries = await Inquiry.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'My inquiries loaded',
    data: { inquiries },
  });
});

exports.updateInquiry = asyncHandler(async (req, res, next) => {
  const inquiry = await Inquiry.findOne({ _id: req.params.id, userId: req.user._id });

  if (!inquiry) return next(new AppError('No inquiry found with that ID or you do not have permission', 404));

  inquiry.type = req.body.type || inquiry.type;
  inquiry.subject = req.body.subject || inquiry.subject;
  inquiry.message = req.body.message || inquiry.message;

  if (req.file) {
    if (inquiry.imageUrl) {
      const oldPath = path.join(__dirname, `../../public${inquiry.imageUrl}`);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    inquiry.imageUrl = `/uploads/feedback/${req.file.filename}`;
  }

  await inquiry.save();

  res.status(200).json({ success: true, data: { inquiry } });
});

exports.deleteInquiry = asyncHandler(async (req, res, next) => {
  const inquiry = await Inquiry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!inquiry) return next(new AppError('No inquiry found with that ID or you do not have permission', 404));

  if (inquiry.imageUrl) {
    const filePath = path.join(__dirname, `../../public${inquiry.imageUrl}`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  res.status(204).json({ success: true, data: null });
});

exports.getAllInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().populate('userId', 'fullName email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'All inquiries loaded (Admin)',
    data: { inquiries },
  });
});

// --- REVIEWS ---

exports.createReview = asyncHandler(async (req, res) => {
  const { rating, message } = req.body;

  if (!rating || !message) {
    throw new AppError('Rating and message are required', 400);
  }

  const review = await Review.create({
    userId: req.user._id,
    rating,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: { review },
  });
});

exports.getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'My reviews loaded',
    data: { reviews },
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { rating: req.body.rating, message: req.body.message },
    { new: true, runValidators: true }
  );

  if (!review) return next(new AppError('No review found with that ID or you do not have permission', 404));

  res.status(200).json({ success: true, data: { review } });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!review) return next(new AppError('No review found with that ID or you do not have permission', 404));

  res.status(204).json({ success: true, data: null });
});

exports.getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().populate('userId', 'fullName email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'All reviews loaded (Admin)',
    data: { reviews },
  });
});

// --- ADMIN REPLIES ---

exports.replyToFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { adminReply: req.body.reply },
    { new: true, runValidators: true }
  );

  if (!feedback) return next(new AppError('No feedback found with that ID', 404));

  res.status(200).json({ success: true, data: { feedback } });
});

exports.replyToInquiry = asyncHandler(async (req, res, next) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { adminReply: req.body.reply, status: 'RESOLVED' },
    { new: true, runValidators: true }
  );

  if (!inquiry) return next(new AppError('No inquiry found with that ID', 404));

  res.status(200).json({ success: true, data: { inquiry } });
});

exports.replyToReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { adminReply: req.body.reply },
    { new: true, runValidators: true }
  );

  if (!review) return next(new AppError('No review found with that ID', 404));

  res.status(200).json({ success: true, data: { review } });
});
