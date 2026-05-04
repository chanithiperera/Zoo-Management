const express = require('express');
const adminController = require('../controllers/admin.controller');
const { createUpload } = require('../middleware/upload.middleware');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const validateRequest = require('../validations/validateRequest');
const {
  createUserRules,
  updateUserRules,
  deleteUserRules,
  updateEntryCatalogRules,
  updateShowCatalogRules,
  createShowCatalogRules,
  deleteCatalogItemRules,
  listAdminBookingsRules,
  listAdminGroupBookingsRules,
  adminGroupBookingIdParamRules,
  updateAdminGroupBookingStatusRules,
  checkInBookingRules,
} = require('../validations/admin.validation');

const router = express.Router();

const showPosterUpload = createUpload('ticket-show', {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(requireDatabase, protect, restrictTo('admin'));

router.get('/users', adminController.listUsers);
router.post('/users', createUserRules, validateRequest, adminController.createUser);
router.patch('/users/:id', updateUserRules, validateRequest, adminController.updateUser);
router.delete('/users/:id', deleteUserRules, validateRequest, adminController.deleteUser);
router.get('/ticket-catalog', adminController.listTicketCatalog);
router.patch('/ticket-catalog/entry/:id', updateEntryCatalogRules, validateRequest, adminController.updateEntryCatalogItem);
router.patch('/ticket-catalog/shows/:id', updateShowCatalogRules, validateRequest, adminController.updateShowCatalogItem);
router.post('/ticket-catalog/shows', createShowCatalogRules, validateRequest, adminController.createShowCatalogItem);
router.post(
  '/ticket-catalog/shows/upload-poster',
  showPosterUpload.single('photo'),
  adminController.uploadShowPoster
);
router.delete('/ticket-catalog/:id', deleteCatalogItemRules, validateRequest, adminController.deleteCatalogItem);
router.get('/bookings', listAdminBookingsRules, validateRequest, adminController.listBookings);
router.post('/bookings/check-in', checkInBookingRules, validateRequest, adminController.checkInBooking);
router.get('/group-bookings', listAdminGroupBookingsRules, validateRequest, adminController.listGroupBookings);
router.patch(
  '/group-bookings/:id/status',
  updateAdminGroupBookingStatusRules,
  validateRequest,
  adminController.updateGroupBookingStatus
);
router.get(
  '/group-bookings/:id/document',
  adminGroupBookingIdParamRules,
  validateRequest,
  adminController.downloadGroupBookingDocument
);

module.exports = router;
