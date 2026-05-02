const express = require('express');
const visitorController = require('../controllers/visitor.controller');
const { requireDatabase } = require('../middleware/db.middleware');

const router = express.Router();

router
  .route('/')
  .post(requireDatabase, visitorController.registerVisitor)
  .get(requireDatabase, visitorController.getAllVisitors);

router.patch('/:id/deactivate', requireDatabase, visitorController.deactivateVisitor);

router
  .route('/:id')
  .get(requireDatabase, visitorController.getVisitorById)
  .patch(requireDatabase, visitorController.updateVisitorProfile)
  .delete(requireDatabase, visitorController.deleteVisitor);

module.exports = router;
