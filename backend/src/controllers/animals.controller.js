const asyncHandler = require('../utils/asyncHandler');

/** Prepared for Phase 2 — Animal Information & Education */
exports.getModuleInfo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Animals module — prepared for Phase 2',
    data: { module: 'animals' },
  });
});
