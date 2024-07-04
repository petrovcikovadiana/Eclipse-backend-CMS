const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const attachTenantId = require('../utils/tokenExtraction'); // Aktualizace importu

const router = express.Router({ mergeParams: true });
//router.use(attachTenantId); // Použití middleware pro extrakci tenantId

router
  .route('/')
  .get(attachTenantId, postController.getAllPosts)
  .post(
    authController.protect,
    attachTenantId,
    postController.uploadPostImg,
    postController.resizePostImg,
    postController.createPost,
  );

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    authController.protect,
    authController.restrictTo('super-admin', 'admin', 'manager', 'editor'),
    attachTenantId,
    postController.uploadPostImg,
    postController.resizePostImg,
    postController.updatePost,
  )
  .delete(
    authController.protect,
    authController.restrictTo('super-admin', 'admin', 'manager', 'editor'),
    attachTenantId,
    // authController.restrictTo('super-admin', 'admin', 'manager'),
    postController.deletePost,
  );

router.delete(
  '/deleteImg/:imageName',
  authController.protect,
  attachTenantId,
  postController.deletePostImage,
);

module.exports = router;
