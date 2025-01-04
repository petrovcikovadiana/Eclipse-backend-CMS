const multer = require('multer'); // Middleware for handling file uploads
const sharp = require('sharp'); // Image processing library
const fs = require('fs').promises; // File system module with promises
const path = require('path'); // Module for working with file and directory paths

const Post = require('../models/postModel'); // Post model for database operations
const catchAsync = require('../utils/catchAsync'); // Utility to handle async errors
const APIFeatures = require('../utils/apiFeatures'); // Utility for API query features
const handleNotFound = require('../utils/handleNotFound'); // Utility to handle missing resources

// Filter files to allow only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Configure multer to store files in memory
const multerStorage = multer.memoryStorage();

// Initialize multer with storage and file filter configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Set file size limit to 10MB
});

// Sharp configuration for resizing images
const sharpConfig = {
  resize: { width: 288, height: 208 },
  format: 'avif',
  options: { quality: 90 },
};

// Middleware to resize and process uploaded images
exports.resizePostImg = catchAsync(async (req, res, next) => {
  if (!req.file) return next(); // Skip if no file uploaded

  req.file.filename = `post-${req.body.slug}-${Date.now()}.avif`; // Generate unique filename

  await sharp(req.file.buffer)
    .resize(sharpConfig.resize.width, sharpConfig.resize.height)
    .toFormat(sharpConfig.format)
    .avif(sharpConfig.options)
    .toFile(
      path.join(__dirname, '..', 'public', 'img', 'posts', req.file.filename),
    ); // Save processed image

  req.body.imageName = req.file.filename; // Add image filename to request body

  next();
});

// Middleware to handle single image upload
exports.uploadPostImg = upload.single('image');

// Get all posts with optional filters
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const filter = { tenantId: req.tenantId || req.params.tenantId }; // Filter by tenant
  const features = new APIFeatures(Post.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate(); // Apply query features
  const posts = await features.query;

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: { posts },
  });
});

// Get a single post by ID
exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({
    _id: req.params.id,
    tenantId: req.params.tenantId || req.tenantId,
  }); // Find post by ID and tenant

  handleNotFound(post, 'Post'); // Handle case where post is not found
  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

// Create a new post
exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create({
    runValidators: true,
    ...req.body,
    imageName: req.file ? req.file.filename : undefined, // Include image if uploaded
    tenantId: req.params.tenantId || req.tenantId,
  });

  res.status(201).json({
    status: 'success',
    data: { post: newPost },
  });
});

// Update an existing post
exports.updatePost = catchAsync(async (req, res, next) => {
  // Find post by ID and tenantId
  const post = await Post.findOne({
    _id: req.params.id,
    tenantId: req.params.tenantId || req.tenantId,
  });

  if (!post) {
    return next(new AppError('No post found with this ID', 404));
  }

  // Check if image is changing
  if (req.file && post.imageName) {
    const oldImagePath = path.join(
      __dirname,
      '..',
      'public',
      'img',
      'posts',
      post.imageName,
    );

    try {
      await fs.access(oldImagePath);
      await fs.unlink(oldImagePath);
    } catch (err) {
      console.warn(`Old image ${post.imageName} not found. Skipping deletion.`);
    }

    // Set new value of `imageName` v `req.body`
    req.body.imageName = req.file.filename;
  }

  // Update post
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { post: updatedPost },
  });
});

// Delete a post by ID
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({
    _id: req.params.id,
    tenantId: req.params.tenantId || req.tenantId,
  });

  // Delete image, if existing
  if (post.imageName) {
    const imagePath = path.join(
      __dirname,
      '..',
      'public',
      'img',
      'posts',
      post.imageName,
    );
    try {
      await fs.access(imagePath);
      await fs.unlink(imagePath);
    } catch (err) {
      console.error('Error deleting image:', err.message);
    }
  }

  // Delete post
  await Post.findByIdAndDelete(post._id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Delete an image file associated with a post
exports.deletePostImage = catchAsync(async (req, res, next) => {
  const image = req.params.imageName;
  const tenantId = req.params.tenantId || req.tenantId;

  const post = await Post.findOne({ imageName: image, tenantId });

  if (!post) {
    return res.status(404).json({
      status: 'fail',
      message: 'No post found with this image and tenantId',
    });
  }

  // const imagePath = path.join(__dirname, '..', 'public', 'img', 'posts', image);

  try {
    // await fs.access(imagePath); // Zkontroluje, zda soubor existuje
    // await fs.unlink(imagePath); // Smaže soubor
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: 'Image file not found.',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
