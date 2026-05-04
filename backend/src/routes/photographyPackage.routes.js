const express = require('express');
const photographyPackageController = require('../controllers/photographyPackage.controller');

const router = express.Router();

router
  .route('/')
  .post(photographyPackageController.createPackage)
  .get(photographyPackageController.getAllPackages);

router.patch('/:id/archive', photographyPackageController.archivePackage);

router
  .route('/:id')
  .get(photographyPackageController.getPackageById)
  .patch(photographyPackageController.updatePackage)
  .delete(photographyPackageController.deletePackage);

module.exports = router;
