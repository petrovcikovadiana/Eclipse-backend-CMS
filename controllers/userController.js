const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const handleNotFound = require('../utils/handleNotFound');

// Controller to get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

// Controller to create a new user
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

// Controller to get a single user
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  handleNotFound(user, 'User');
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Controller to update a user
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  handleNotFound(user, 'User');
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Controller to delete a user
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  handleNotFound(user, 'User');
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
