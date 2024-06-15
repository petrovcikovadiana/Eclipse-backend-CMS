const express = require('express');
const tenantController = require('../controllers/tenantController');
const authController = require('../controllers/authController');
const postRouter = require('./postRoutes');
const configRouter = require('./configRoutes');

const router = express.Router();

router.use(
  authController.protect,
  // authController.restrictTo('super-admin')
);

router
  .route('/')
  .post(tenantController.createTenant)
  .get(tenantController.getAllTenants);

router
  .route('/:id')
  .get(tenantController.getTenantById)
  .patch(tenantController.updateTenant)
  .delete(tenantController.deleteTenant);

// Nested routes for posts and configs
router.use('/:tenantId/posts', postRouter);
router.use('/:tenantId/configs', configRouter);

module.exports = router;
