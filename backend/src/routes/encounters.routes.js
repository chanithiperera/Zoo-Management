const express = require('express');
const encountersController = require('../controllers/encounters.controller');

const router = express.Router();

router.get('/', encountersController.getModuleInfo);

module.exports = router;
