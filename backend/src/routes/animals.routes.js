const express = require('express');
const animalsController = require('../controllers/animals.controller');

const router = express.Router();

router.get('/', animalsController.getAllAnimals);
router.get('/:id', animalsController.getAnimalById);

module.exports = router;
