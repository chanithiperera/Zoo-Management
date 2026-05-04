const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

exports.registerVisitor = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    throw new AppError('fullName, email, phone, and password are required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const visitor = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    password: hashedPassword,
    role: 'visitor',
  });

  const safeVisitor = await User.findById(visitor._id).select('-password');

  res.status(201).json({
    success: true,
    message: 'Visitor registered successfully',
    data: safeVisitor,
  });
});

exports.getAllVisitors = asyncHandler(async (req, res) => {
  const visitors = await User.find({ role: 'visitor' }).select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: visitors.length,
    data: visitors,
  });
});

exports.getVisitorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid visitor ID', 400);
  }

  const visitor = await User.findOne({ _id: id, role: 'visitor' }).select('-password');
  if (!visitor) {
    throw new AppError('Visitor not found', 404);
  }

  res.status(200).json({
    success: true,
    data: visitor,
  });
});

exports.updateVisitorProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid visitor ID', 400);
  }

  const updatePayload = {};
  if (Object.prototype.hasOwnProperty.call(req.body, 'fullName')) {
    updatePayload.fullName = req.body.fullName?.trim();
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
    updatePayload.email = req.body.email?.trim().toLowerCase();
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) {
    updatePayload.phone = req.body.phone?.trim();
  }

  if (updatePayload.email) {
    const taken = await User.findOne({
      email: updatePayload.email,
      _id: { $ne: id },
    });
    if (taken) {
      throw new AppError('An account with this email already exists', 409);
    }
  }

  const updatedVisitor = await User.findOneAndUpdate(
    { _id: id, role: 'visitor' },
    { $set: updatePayload },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedVisitor) {
    throw new AppError('Visitor not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Visitor profile updated successfully',
    data: updatedVisitor,
  });
});

exports.deleteVisitor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid visitor ID', 400);
  }

  const deletedVisitor = await User.findOneAndDelete({ _id: id, role: 'visitor' });
  if (!deletedVisitor) {
    throw new AppError('Visitor not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Visitor deleted successfully',
  });
});

exports.deactivateVisitor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid visitor ID', 400);
  }

  const visitor = await User.findOneAndUpdate(
    { _id: id, role: 'visitor' },
    { $set: { isActive: false } },
    { new: true, runValidators: true }
  ).select('-password');

  if (!visitor) {
    throw new AppError('Visitor not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Visitor deactivated successfully',
    data: visitor,
  });
});
