const express = require('express');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
const attachTenantId = require('../utils/tokenExtraction');

const router = express.Router();

router
  .route('/')
  .get(attachTenantId, categoryController.getAllCategories)
  .post(
    authController.protect,
    attachTenantId,
    categoryController.createCategory,
  );

router
  .route('/:id')
  .get(attachTenantId, categoryController.getCategory)
  .patch(
    authController.protect,
    attachTenantId,
    categoryController.updateCategory,
  )
  .delete(
    authController.protect,
    attachTenantId,
    categoryController.deleteCategory,
  );

// New route for updating the order of price lists
router.put(
  '/order',
  authController.protect, // Ensures the user is authenticated
  attachTenantId, // Extracts tenant ID from the token
  categoryController.updateCategoryOrder, // Handles updating the order
);

module.exports = router;
