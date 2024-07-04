const express = require('express');
const configController = require('../controllers/configController');
const authController = require('../controllers/authController');
const attachTenantId = require('../utils/tokenExtraction'); // Aktualizace importu

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(attachTenantId, configController.getAllConfigs)
  .post(
    authController.protect,
    authController.restrictTo('super-admin', 'admin', 'manager', 'editor'),
    attachTenantId,
    configController.createConfig,
  );

router
  .route('/all')
  .get(
    authController.protect,
    authController.restrictTo('super-admin', 'admin'),
    configController.getAllConfigsWithoutTenant,
  );

router
  .route('/key/:config_key')
  .get(attachTenantId, configController.getConfigByKey)
  .patch(
    authController.protect,
    authController.restrictTo('super-admin', 'admin', 'manager', 'editor'),
    configController.updateConfigByKey,
  )
  .delete(
    authController.protect,
    authController.restrictTo('super-admin', 'admin', 'manager', 'editor'),
    configController.deleteConfigByKey,
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('super-admin', 'admin', 'manager', 'editor'),
    configController.getConfigById,
  )
  .patch(
    authController.protect,
    authController.restrictTo('super-admin', 'admin', 'manager', 'editor'),
    configController.updateConfigById,
  )
  .delete(
    authController.protect,
    authController.restrictTo('super-admin', 'admin'),
    configController.deleteConfigById,
  );

module.exports = router;
