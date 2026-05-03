const { param } = require('express-validator');

exports.mongoAnimalIdParamRules = [param('animalId').isMongoId().withMessage('Invalid animal id')];
