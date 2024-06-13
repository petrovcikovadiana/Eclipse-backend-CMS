const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const handleNotFound = require('../utils/handleNotFound');

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const multerStorage = multer.memoryStorage();

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

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

exports.uploadPostImg = upload.single('image');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const filter = req.tenantId ? { tenant: req.tenantId } : {};
  const features = new APIFeatures(Post.find(filter), req.query)
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

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ _id: req.params.id, tenant: req.tenantId });
  handleNotFound(post, 'Post');
  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create({
    runValidators: true,
    ...req.body,
    imageName: req.file ? req.file.filename : undefined,
    tenant: req.tenantId, // Přidání tenantId do příspěvku
  });

  res.status(201).json({
    status: 'success',
    data: { post: newPost },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, tenant: req.tenantId },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );
  handleNotFound(post, 'Post');
  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    tenant: req.tenantId,
  });
  handleNotFound(post, 'Post');
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

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
