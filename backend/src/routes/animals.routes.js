const express = require('express');
const {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} = require('../controllers/animals.controller');

const router = express.Router();

router.route('/').get(getAllAnimals).post(createAnimal);

router.route('/:id').get(getAnimalById).put(updateAnimal).delete(deleteAnimal);

module.exports = router;
