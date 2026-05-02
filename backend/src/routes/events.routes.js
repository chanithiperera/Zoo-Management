const express = require('express');
const eventsController = require('../controllers/events.controller');

const router = express.Router();

router.get('/', eventsController.getModuleInfo);

module.exports = router;
