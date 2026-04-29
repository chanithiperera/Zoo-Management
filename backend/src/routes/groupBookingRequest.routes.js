const express = require('express');
const multer = require('multer');
const groupBookingRequestController = require('../controllers/groupBookingRequest.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const { createUpload } = require('../middleware/upload.middleware');
const validateRequest = require('../validations/validateRequest');
const {
  createGroupRequestRules,
  groupRequestIdParamRules,
} = require('../validations/groupBookingRequest.validation');

const router = express.Router();

const SUPPORTING_DOC_FIELD = 'supportingDocument';
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const groupLetterUpload = createUpload('ticket-show-group-letters', {
  limits: { fileSize: MAX_FILE_BYTES },
});

/**
 * Wraps multer single() to translate MulterError + fileFilter rejections into 400 responses.
 */
function uploadGroupLetter(req, res, next) {
  groupLetterUpload.single(SUPPORTING_DOC_FIELD)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Supporting document is too large (max 5 MB)'
          : `Upload error: ${err.message}`;
      return res.status(400).json({ success: false, message });
    }
    if (err) {
      const statusCode = err.statusCode || 400;
      return res.status(statusCode).json({ success: false, message: err.message });
    }
    next();
  });
}

router.post(
  '/',
  requireDatabase,
  protect,
  uploadGroupLetter,
  createGroupRequestRules,
  validateRequest,
  groupBookingRequestController.createGroupRequest
);

router.get('/me', requireDatabase, protect, groupBookingRequestController.getMyGroupRequests);

router.get(
  '/:id',
  requireDatabase,
  protect,
  groupRequestIdParamRules,
  validateRequest,
  groupBookingRequestController.getGroupRequestById
);

module.exports = router;
