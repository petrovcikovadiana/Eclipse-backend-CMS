const express = require('express');
const galleryController = require('../controllers/galleryController');
const authController = require('../controllers/authController');
const attachTenantId = require('../utils/tokenExtraction');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(attachTenantId, galleryController.getAllPhotos)
  .post(
    authController.protect,
    attachTenantId,
    galleryController.uploadSingleImage,
    galleryController.resizeGalleryImg,
    galleryController.addPhotoToGallery,
  );

router
  .route('/:photoId')
  .delete(
    authController.protect,
    attachTenantId,
    galleryController.deletePhotoFromGallery,
  )
  .patch(
    authController.protect,
    attachTenantId,
    galleryController.uploadSingleImage,
    galleryController.resizeGalleryImg,
    galleryController.updatePhotoInGallery,
  );

router.put(
  '/order',
  authController.protect,
  attachTenantId,
  galleryController.updatePhotoOrder,
);

module.exports = router;
