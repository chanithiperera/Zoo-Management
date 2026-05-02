const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  const { user, token } = await authService.registerUser({
    fullName,
    email,
    phone,
    password,
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user, token },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
});

/**
 * GET /api/auth/me — current user (JWT required)
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile loaded',
    data: { user: req.user },
  });
});

/**
 * PATCH /api/auth/me — update current user profile (JWT required)
 */
const updateMe = asyncHandler(async (req, res) => {
  const { fullName, email, phone } = req.body;
  const user = await authService.updateProfile(req.user._id, { fullName, email, phone });

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: { user },
  });
});

/**
 * PATCH /api/auth/me/password — change password (JWT required)
 */
const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, { currentPassword, newPassword });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    data: {},
  });
});

module.exports = { register, login, getMe, updateMe, changeMyPassword };
