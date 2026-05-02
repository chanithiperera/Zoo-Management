const asyncHandler = require('../utils/asyncHandler');

/** Prepared for Phase 2 — Feedback, Inquiry & Review */
exports.getModuleInfo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feedback module — prepared for Phase 2',
    data: { module: 'feedback' },
  });
});
