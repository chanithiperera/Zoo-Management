const express = require('express');
const animalsController = require('../controllers/animals.controller');
<<<<<<< HEAD
=======
<<<<<<< HEAD
const { createUpload } = require('../middleware/upload.middleware');

const router = express.Router();
const upload = createUpload('animals');

router
  .route('/')
  .post(upload.any(), animalsController.addAnimal)
  .get(animalsController.getAllAnimals);

router.patch('/:id/unavailable', animalsController.markAnimalUnavailable);

router
  .route('/:id')
  .get(animalsController.getAnimalById)
  .patch(upload.any(), animalsController.updateAnimal)
  .delete(animalsController.deleteAnimal)
  .post(animalsController.deleteAnimal);
=======
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035

const router = express.Router();

router.get('/', animalsController.getModuleInfo);
<<<<<<< HEAD
=======
>>>>>>> c824c01f2ee0305888ee69dff77383ac43361c08
>>>>>>> 0f8639197f93fefd9284caf0561929e9c2425035

module.exports = router;
