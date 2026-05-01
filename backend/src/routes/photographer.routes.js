const express = require('express');
const photographerController = require('../controllers/photographer.controller');

const router = express.Router();

router
  .route('/')
  .post(photographerController.addPhotographer)
  .get(photographerController.getAllPhotographers);

router.patch('/:id/deactivate', photographerController.deactivatePhotographer);
router.patch('/:id/rating', photographerController.addPhotographerRating);

router
  .route('/:id')
  .get(photographerController.getPhotographerById)
  .patch(photographerController.updatePhotographer)
  .delete(photographerController.deletePhotographer)
  .post(photographerController.deletePhotographer); // ADDED POST AS FALLBACK

module.exports = router;
