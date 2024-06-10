const express = require('express');
const configController = require('../controllers/configController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(configController.getAllConfigs)
  .post(authController.protect, configController.createConfig)
  .patch(authController.protect, configController.updateConfig);

router
  .route('/:config_key')
  .get(configController.getConfig)
  .patch(authController.protect, configController.updateConfig)
  .delete(authController.protect, configController.deleteConfig);

module.exports = router;
