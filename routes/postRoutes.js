const express = require('express');

const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

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
    authController.restrictTo('super-admin', 'admin', 'manager'),
    postController.deletePost,
  );

router.delete(
  '/deleteImg/:imageName',
  authController.protect,
  postController.deletePostImage,
);

module.exports = router;
