const express = require('express');
const configController = require('../controllers/configController');
const authController = require('../controllers/authController');
const attachTenantId = require('../utils/tokenExtraction'); // Aktualizace importu

const router = express.Router({ mergeParams: true });
router.use(attachTenantId); // Použití middleware pro extrakci tenantId

router
  .route('/')
  .get(authController.protect, configController.getAllConfigs)
  .post(authController.protect, configController.createConfig);

router
  .route('/:config_key')
  .get(authController.protect, configController.getConfig)
  .patch(authController.protect, configController.updateConfig)
  .delete(authController.protect, configController.deleteConfig);

module.exports = router;
