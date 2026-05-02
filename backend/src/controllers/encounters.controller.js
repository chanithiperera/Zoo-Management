const asyncHandler = require('../utils/asyncHandler');

/** Prepared for Phase 2 — Animal Encounter & Photography */
exports.getModuleInfo = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Encounters module — prepared for Phase 2',
    data: { module: 'encounters' },
  });
});
