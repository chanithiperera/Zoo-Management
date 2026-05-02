const asyncHandler = require('../utils/asyncHandler');

/** Prepared for Phase 2 — Event Management */
exports.getModuleInfo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Events module — prepared for Phase 2',
    data: { module: 'events' },
  });
});
