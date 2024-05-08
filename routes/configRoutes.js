const express = require('express');
const configController = require('../controllers/configController');

const router = express.Router();

router
  .route('/')
  .get(configController.getAllConfigs)
  .post(configController.createConfig)
  .patch(configController.updateConfig);

router
  .route('/:config_key')
  .get(configController.getConfig)
  .patch(configController.updateConfig)
  .delete(configController.deleteConfig);

module.exports = router;
