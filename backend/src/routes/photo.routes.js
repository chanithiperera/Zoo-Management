const express = require('express');
const photoController = require('../controllers/photo.controller');
const { createUpload } = require('../middleware/upload.middleware');

const router = express.Router();
const upload = createUpload('photos');

router
  .route('/')
  .post(upload.any(), photoController.uploadPhoto)
  .get(photoController.getAllPhotos);

router.get('/booking/:bookingId', photoController.getPhotosByBookingId);
router.patch('/:id/favorite', photoController.markPhotoFavorite);

router.route('/:id').patch(photoController.updatePhoto).delete(photoController.deletePhoto);

module.exports = router;
