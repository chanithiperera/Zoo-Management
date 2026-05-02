const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

const hashPassword = async (plain) => bcrypt.hash(plain, SALT_ROUNDS);

const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

const signToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const registerUser = async ({ fullName, email, phone, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }
  const hashed = await hashPassword(password);
  const user = await User.create({
    fullName,
    email,
    phone,
    password: hashed,
    role: 'visitor',
  });
  const token = signToken(user._id, user.role);
  const safeUser = await User.findById(user._id).select('-password');
  return { user: safeUser, token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  const match = await comparePassword(password, user.password);
  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }
  const token = signToken(user._id, user.role);
  user.password = undefined;
  return { user, token };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

const updateProfile = async (userId, { fullName, email, phone }) => {
  const existing = await User.findById(userId).select('email');
  if (!existing) {
    throw new AppError('User not found', 404);
  }
  const nextEmail = email.trim().toLowerCase();
  if (nextEmail !== existing.email) {
    const taken = await User.findOne({ email: nextEmail, _id: { $ne: userId } });
    if (taken) {
      throw new AppError('An account with this email already exists', 409);
    }
  }
  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName: fullName.trim(),
        email: nextEmail,
        phone: phone.trim(),
      },
    },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updated) {
    throw new AppError('User not found', 404);
  }
  return updated;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const ok = await comparePassword(currentPassword, user.password);
  if (!ok) {
    throw new AppError('Current password is incorrect', 401);
  }
  const hashed = await hashPassword(newPassword);
  await User.findByIdAndUpdate(
    userId,
    { $set: { password: hashed } },
    { runValidators: true }
  );
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateProfile,
  changePassword,
  signToken,
};
