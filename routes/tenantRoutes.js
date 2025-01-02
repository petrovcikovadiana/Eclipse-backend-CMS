const express = require('express');
const tenantController = require('../controllers/tenantController');
const authController = require('../controllers/authController');
const postRouter = require('./postRoutes');
const configRouter = require('./configRoutes');
const userRouter = require('./userRoutes');
const priceListRouter = require('./priceListRoutes');
const employeeRouter = require('./employeeRoutes');
const tenantRouter = require('./tenantRoutes');
const categoryRouter = require('./categoryRoutes');
const attachTenantId = require('../utils/tokenExtraction'); // Aktualizace importu
const priceListController = require('../controllers/priceListController');

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
router.put(
  '/order',
  authController.protect,
  attachTenantId,
  priceListController.updatePriceListOrder,
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
router.use('/:tenantId/categories', categoryRouter);
router.use(
  '/:tenantId/priceLists',
  (req, res, next) => {
    next();
  },
  priceListRouter,
);
router.use('/:tenantId/employees', attachTenantId, employeeRouter);

module.exports = router;
