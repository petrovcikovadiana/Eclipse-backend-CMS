const crypto = require('crypto'); // Built-in Node.js module for cryptographic operations
const { promisify } = require('util'); // Utility module to simplify asynchronous operations
const jwt = require('jsonwebtoken'); // Library for working with JSON Web Tokens
const dotenv = require('dotenv'); // Module to load environment variables
const AppError = require('../utils/appError'); // Custom error handling utility
const Email = require('../utils/email'); // Utility for sending emails
const catchAsync = require('../utils/catchAsync'); // Utility to handle asynchronous errors
const User = require('../models/userModel'); // User model for database operations

dotenv.config({ path: '../config.env' }); // Load environment variables

// Generate a JWT token
const signToken = (id, tenantId) =>
  jwt.sign({ id, tenantId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES, // Token expiration
  });

// Create and send a token to the client
const createSendToken = (user, tenantId, statusCode, res) => {
  const token = signToken(user._id, tenantId);
  user.password = undefined; // Remove password from the output
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Signup a new user or update an existing invited user
exports.signup = catchAsync(async (req, res, next) => {
  const { userName, email, password, passwordConfirm, passwordChangedAt, tenantId } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Check if user exists as an invite
  let user = await User.findOne({ email, isInvite: true });

  if (user) {
    // Update existing invited user
    user.userName = userName;
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordChangedAt = passwordChangedAt;
    user.isInvite = false;
    await user.save();
  } else {
    // Create a new user
    user = await User.create({
      userName,
      email,
      password,
      passwordConfirm,
      passwordChangedAt,
      tenantId: [tenantId],
    });
  }

  await new Email(user).sendWelcome(); // Send welcome email
  res.status(201).json({
    status: 'success',
    message: 'User created successfully.',
  });
});

// Login a user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password'); // Include password for verification

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, user.tenantId[0], 200, res); // Send token to client
});

// Protect routes by requiring authentication
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // Verify token

  const currentUser = await User.findById(decoded.id); // Get user details
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  req.user = currentUser;
  req.tenantId = decoded.tenantId;
  next();
});

// Restrict access to specific roles
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

// Handle forgot password functionality
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email.', 404));
  }

  const resetToken = user.createPasswordResetToken(); // Create a reset token
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset(); // Send reset email
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending email. Try again later!', 500));
  }
});

// Handle password reset functionality
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, user.tenantId[0], 200, res);
});

// Update user password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, user.tenantId[0], 200, res);
});

// Check if a token is valid
exports.checkToken = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again.',
      });
    }

    res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    return next(new AppError('Error validating token. Please try again later.', 500));
  }
});
