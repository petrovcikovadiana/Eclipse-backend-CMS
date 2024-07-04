const express = require('express');
const tenantController = require('../controllers/tenantController');
const authController = require('../controllers/authController');
const postRouter = require('./postRoutes');
const configRouter = require('./configRoutes');
const userRouter = require('./userRoutes');

const router = express.Router();

// router.use(
//   authController.protect,
// authController.restrictTo('super-admin')
// );

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('super-admin'),
    tenantController.createTenant,
  )
  .get(
    authController.protect,
    authController.restrictTo('super-admin', 'admin'),
    tenantController.getAllTenants,
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('super-admin', 'admin'),
    tenantController.getTenantById,
  )
  .patch(
    authController.protect,
    authController.restrictTo('super-admin', 'admin'),
    tenantController.updateTenant,
  )
  .delete(
    authController.protect,
    authController.restrictTo('super-admin'),
    tenantController.deleteTenant,
  );

// Nested routes for posts and configs
router.use('/:tenantId/posts', postRouter);
router.use('/:tenantId/configs', configRouter);
router.use('/:tenantId/users', userRouter);

module.exports = router;
