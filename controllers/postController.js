// Import necessary modules
const multer = require('multer');
const Post = require('../models/postModel');

// Configure multer for handling file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/posts'); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1]; // Extract the file extension
    cb(null, `post-${req.body.slug}-${Date.now()}.${ext}`); // Generate a unique filename
  },
});

// File filter to ensure only images are uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // Allow the upload if the file is an image
  } else {
    cb(new Error('Not an image Please upload only images.'), false); // Reject the upload if the file is not an image
    //TODO-> cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Initialize multer with the configured storage and file filter
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Middleware for uploading a single image
exports.uploadPostImg = upload.single('image');

// Function to retrieve all posts
exports.getAllPosts = async (req, res) => {
  try {
    // Prepare the query object excluding certain fields
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((field) => delete queryObj[field]);

    // Execute the query to fetch posts
    const query = await Post.find(queryObj);
    const posts = await query;

    // Send the response with the fetched posts
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts,
      },
    });
  } catch (err) {
    // Handle errors and send an appropriate response
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Function to retrieve a single post by ID
exports.getPost = async (req, res) => {
  try {
    // Fetch the post by ID
    const post = await Post.findById(req.params.id);
    // Send the response with the fetched post
    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (err) {
    // Handle errors and send an appropriate response
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Function to create a new post
exports.createPost = async (req, res) => {
  try {
    // Create a new post with the provided data and image
    const newPost = await Post.create({
      ...req.body,
      image: req.file.filename,
    });
    // Send the response with the newly created post
    res.status(201).json({
      status: 'success',
      data: {
        posts: newPost,
      },
    });
  } catch (err) {
    // Handle errors and send an appropriate response
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

// Function to update an existing post
exports.updatePost = async (req, res) => {
  try {
    // Update the post with the provided data
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    // Send the response with the updated post
    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (err) {
    // Handle errors and send an appropriate response
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

// Function to delete a post
exports.deletePost = async (req, res) => {
  try {
    // Delete the post by ID
    await Post.findByIdAndDelete(req.params.id);
    // Send a successful response
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    // Handle errors and send an appropriate response
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};
