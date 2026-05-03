const express = require('express');
const {
  addAnimal,
  getAllAnimals,
  getAnimalById,
  updateAnimal,
  deleteAnimal,
} = require('../controllers/encounterAnimals.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { createUpload } = require('../middleware/upload.middleware');

const router = express.Router();
const upload = createUpload('animals');

router
  .route('/')
  .get(getAllAnimals)
  .post(protect, restrictTo('admin'), upload.single('image'), addAnimal);

router
  .route('/:id')
  .get(getAnimalById)
  .patch(protect, restrictTo('admin'), upload.single('image'), updateAnimal)
  .delete(protect, restrictTo('admin'), deleteAnimal);

module.exports = router;
