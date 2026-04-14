const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: 'Users loaded',
    data: { users },
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;
  const nextEmail = email.trim().toLowerCase();
  const taken = await User.findOne({ email: nextEmail });
  if (taken) {
    throw new AppError('An account with this email already exists', 409);
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const created = await User.create({
    fullName: fullName.trim(),
    email: nextEmail,
    phone: phone.trim(),
    password: hashedPassword,
    role,
  });
  const safeUser = await User.findById(created._id).select('-password');
  res.status(201).json({
    success: true,
    message: 'User created',
    data: { user: safeUser },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone, role } = req.body;
  const nextEmail = email.trim().toLowerCase();

  const existing = await User.findById(id).select('email');
  if (!existing) {
    throw new AppError('User not found', 404);
  }
  if (nextEmail !== existing.email) {
    const taken = await User.findOne({ email: nextEmail, _id: { $ne: id } });
    if (taken) {
      throw new AppError('An account with this email already exists', 409);
    }
  }

  const updated = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        fullName: fullName.trim(),
        email: nextEmail,
        phone: phone.trim(),
        role,
      },
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'User updated',
    data: { user: updated },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('User not found', 404);
  }
  res.status(200).json({
    success: true,
    message: 'User deleted',
    data: {},
  });
});

module.exports = { listUsers, createUser, updateUser, deleteUser };
