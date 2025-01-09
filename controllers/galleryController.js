const multer = require('multer'); // Middleware for handling file uploads
const sharp = require('sharp'); // Image processing library
const fs = require('fs').promises; // File system module with promises
const path = require('path'); // Module for working with file and directory paths

const Gallery = require('../models/galleryModel'); // Gallery model for database operations
const catchAsync = require('../utils/catchAsync'); // Utility to handle async errors
const APIFeatures = require('../utils/apiFeatures'); // Utility for API query features
const handleNotFound = require('../utils/handleNotFound'); // Utility to handle missing resources

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // Only images accepted
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Export middleware for simple upload
exports.uploadSingleImage = upload.single('image');

// Sharp configuration for resizing imagess
const sharpConfig = {
  resize: { width: 1920 },
  format: 'avif',
  options: { quality: 80 },
};

// Middleware to resize and process uploaded images
exports.resizeGalleryImg = catchAsync(async (req, res, next) => {
  if (!req.file) return next(); // Skip if no file uploaded

  filename = `gallery-${req.body.slug}-${Date.now()}.avif`; // Generate unique filename

  await sharp(req.file.buffer)
    .resize(sharpConfig.resize)
    .toFormat(sharpConfig.format)
    .avif(sharpConfig.options)
    .toFile(path.join(__dirname, '..', 'public', 'img', 'galleries', filename)); // Save processed image

  req.body.imageName = filename; // Add image filename to request body

  next();
});

// Add photo to gallery
exports.addPhotoToGallery = catchAsync(async (req, res, next) => {
  const tenantId = req.params.tenantId;

  if (!req.body.imageName) {
    return next(new AppError('Image upload failed.', 400));
  }

  const gallery = await Gallery.findOneAndUpdate(
    { tenantId },
    { $push: { photos: { imageName: req.body.imageName, tenantId } } },
    { new: true, upsert: true }, // Create new document, if non existing
  );

  res.status(201).json({
    status: 'success',
    data: { photo: gallery.photos.slice(-1)[0] }, // Return just added photo
  });
});

exports.deletePhotoFromGallery = catchAsync(async (req, res, next) => {
  const { photoId, tenantId } = req.params;

  // Find gallery and photo to delete
  const gallery = await Gallery.findOne({ tenantId });

  if (!gallery) {
    return next(new AppError('Gallery not found.', 404));
  }

  // Find foto in array "photos"
  const photo = gallery.photos.find((p) => p._id.toString() === photoId);

  if (!photo) {
    return next(new AppError('Photo not found in gallery.', 404));
  }

  // Delete photo from database
  const imagePath = path.join(
    __dirname,
    '..',
    'public',
    'img',
    'galleries',
    photo.imageName,
  );
  try {
    await fs.unlink(imagePath); // Delete
  } catch (err) {
    console.warn(`Failed to delete image file: ${err.message}`);
  }

  // Delete photo from database
  await Gallery.findOneAndUpdate(
    { tenantId },
    { $pull: { photos: { _id: photoId } } },
    { new: true },
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Update photo in gallery
exports.updatePhotoInGallery = catchAsync(async (req, res, next) => {
  const { photoId, tenantId } = req.params;

  // Find gallery by tenantId and photoId
  const gallery = await Gallery.findOne({ tenantId, 'photos._id': photoId });
  if (!gallery) {
    return next(new AppError('Gallery or photo not found.', 404));
  }

  const photo = gallery.photos.id(photoId);
  if (!photo) {
    return next(new AppError('Photo not found.', 404));
  }

  // Delete old photo
  const oldImagePath = path.join(
    __dirname,
    '..',
    'public',
    'img',
    'galleries',
    photo.imageName,
  );

  try {
    await fs.access(oldImagePath);
    await fs.unlink(oldImagePath);
  } catch (err) {
    console.warn('Old image not found or could not be deleted.');
  }

  // Save new photo
  photo.imageName = req.body.imageName;
  await gallery.save();

  res.status(200).json({
    status: 'success',
    data: { photo },
  });
});

exports.updatePhotoOrder = catchAsync(async (req, res, next) => {
  const { tenantId } = req.params;
  const { photos } = req.body; //  New order photos

  const gallery = await Gallery.findOne({ tenantId });
  if (!gallery) {
    return next(new AppError('Gallery not found.', 404));
  }

  // Update order of photos by new order ID
  gallery.photos = photos.map((photoId) => {
    return gallery.photos.id(photoId);
  });

  await gallery.save();

  res.status(200).json({
    status: 'success',
    data: { photos: gallery.photos },
  });
});

// Get all photos
exports.getAllPhotos = catchAsync(async (req, res, next) => {
  const tenantId = req.params.tenantId;

  const gallery = await Gallery.findOne({ tenantId });
  if (!gallery) {
    return next(new AppError('Gallery not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { photos: gallery.photos },
  });
});
