// Import necessary modules
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs').promises; // Use promise-based fs methods
const path = require('path');

const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const handleNotFound = require('../utils/handleNotFound');

// File filter to ensure only images are uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // Allow the upload if the file is an image
  } else {
    cb(new Error('Not an image! Please upload only images.'), false); // Reject the upload if the file is not an image
  }
};

const multerStorage = multer.memoryStorage();

// Initialize multer with the configured storage and file filter
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Middleware for resizing and saving the image
const sharpConfig = {
  resize: { width: 288, height: 208 },
  format: 'avif',
  options: { quality: 90 },
};

exports.resizePostImg = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `post-${req.body.slug}-${Date.now()}.avif`;

  await sharp(req.file.buffer)
    .resize(sharpConfig.resize.width, sharpConfig.resize.height)
    .toFormat(sharpConfig.format)
    .avif(sharpConfig.options)
    .toFile(
      path.join(__dirname, '..', 'public', 'img', 'posts', req.file.filename),
    );

  req.body.imageName = req.file.filename;

  next();
});

// Middleware for uploading a single image
exports.uploadPostImg = upload.single('image');

// Function to retrieve all posts
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const posts = await features.query;

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: { posts },
  });
});

// Function to retrieve a single post by ID
exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  handleNotFound(post, 'Post');
  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

// Function to create a new post
exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create({
    runValidators: true,
    ...req.body,
    imageName: req.file ? req.file.filename : undefined,
  });

  res.status(201).json({
    status: 'success',
    data: { post: newPost },
  });
});

// Function to update an existing post
exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  handleNotFound(post, 'Post');
  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

// Function to delete a post
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  handleNotFound(post, 'Post');
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Function to delete a post image
exports.deletePostImage = catchAsync(async (req, res, next) => {
  const image = req.params.imageName;
  const imagePath = path.join(__dirname, '..', 'public', 'img', 'posts', image);

  try {
    await fs.access(imagePath);
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: 'Image file not found.',
    });
  }

  await fs.unlink(imagePath);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
