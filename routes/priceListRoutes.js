const express = require('express');
const priceListController = require('../controllers/priceListController');
const authController = require('../controllers/authController');
const attachTenantId = require('../utils/tokenExtraction');

const router = express.Router();

router
  .route('/')
  .get(attachTenantId, priceListController.getAllPriceLists)
  .post(
    authController.protect,
    attachTenantId,
    priceListController.createPriceList,
  );

router
  .route('/:id')
  .get(authController.protect, priceListController.getPriceList)
  .patch(
    authController.protect,
    attachTenantId,
    priceListController.updatePriceList,
  )
  .delete(
    authController.protect,
    attachTenantId,
    priceListController.deletePriceList,
  );

// New route for updating the order of price lists
router.put(
  '/order',
  authController.protect, // Ensures the user is authenticated
  attachTenantId, // Extracts tenant ID from the token
  priceListController.updatePriceListOrder, // Handles updating the order
);

module.exports = router;
