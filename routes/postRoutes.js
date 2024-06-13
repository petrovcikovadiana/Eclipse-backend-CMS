const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const attachTenantId = require('../utils/tokenExtraction'); // Aktualizace importu

const router = express.Router({ mergeParams: true });
router.use(attachTenantId); // Použití middleware pro extrakci tenantId

router
  .route('/')
  .get(postController.getAllPosts)
  .post(
    authController.protect,
    postController.uploadPostImg,
    postController.resizePostImg,
    postController.createPost,
  );

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    authController.protect,
    postController.uploadPostImg,
    postController.resizePostImg,
    postController.updatePost,
  )
  .delete(
    authController.protect,
    // authController.restrictTo('super-admin', 'admin', 'manager'),
    postController.deletePost,
  );

router.delete(
  '/deleteImg/:imageName',
  authController.protect,
  postController.deletePostImage,
);

module.exports = router;
