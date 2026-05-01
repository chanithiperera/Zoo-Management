const express = require('express');
const router = express.Router();
const {
  createEducation,
  getAllEducation,
  getEducationByAnimal,
  updateEducation,
  deleteEducation,
} = require('../controllers/education.controller');

router.route('/').get(getAllEducation).post(createEducation);

router.route('/:id').put(updateEducation).delete(deleteEducation);

router.get('/animal/:animalId', getEducationByAnimal);

module.exports = router;
