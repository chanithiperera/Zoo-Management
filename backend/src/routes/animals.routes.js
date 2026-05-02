const express = require('express');
const animalsController = require('../controllers/animals.controller');

const router = express.Router();

router.get('/', animalsController.getModuleInfo);

module.exports = router;
