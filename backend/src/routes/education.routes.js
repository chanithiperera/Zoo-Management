const express = require('express');
const router = express.Router();
const {
  createEducation,
  getAllEducation,
  getEducationByAnimal,
  updateEducation,
  deleteEducation,
} = require('../controllers/education.controller');

const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireDatabase } = require('../middleware/db.middleware');
const validateRequest = require('../validations/validateRequest');
const { createEducationRules, updateEducationRules, deleteEducationRules } = require('../validations/education.validation');
const { mongoAnimalIdParamRules } = require('../validations/common.params.validation');

router.use(requireDatabase);

router.get('/animal/:animalId', mongoAnimalIdParamRules, validateRequest, getEducationByAnimal);

router.route('/').get(getAllEducation).post(protect, restrictTo('admin'), createEducationRules, validateRequest, createEducation);

router
  .route('/:id')
  .put(protect, restrictTo('admin'), updateEducationRules, validateRequest, updateEducation)
  .delete(protect, restrictTo('admin'), deleteEducationRules, validateRequest, deleteEducation);

module.exports = router;
