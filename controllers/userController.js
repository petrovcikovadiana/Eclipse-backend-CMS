const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const jwt = require('jsonwebtoken');
const handleNotFound = require('../utils/handleNotFound');
const Tenant = require('../models/tenantModel');
const Email = require('../utils/email');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

// Controller to get all users
exports.getAllTenantUsers = catchAsync(async (req, res, next) => {
  const filter = req.tenantId ? { tenants: req.tenantId } : {};
  const features = new APIFeatures(User.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

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

exports.inviteUser = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide email.', 400));
  }

  const emailList = email.split(',');

  for (const email of emailList) {
    // Check if the user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if not exists
      user = await User.create({
        email,
        role: 'user',
        tenants: [req.tenantId],
        isInvite: true,
      });
    }

    // Find the tenant and add the user to the tenant's user list
    const tenant = await Tenant.findOne({ tenantId: req.tenantId });
    tenant.users.push(user._id);
    await tenant.save();

    // Generate a signup token
    const token = jwt.sign(
      { id: user._id, tenantId: tenant.tenantId },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h', // Token expiry time
      },
    );

    const signupUrl = `${req.protocol}://${req.get('host')}/signup?token=${token}`;

    await new Email(user, signupUrl).sendUserInvite();
  }

  res.status(201).json({
    status: 'success',
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }

  //Filtering unwanted fields names are not allowed to be updated
  const filteredBody = filterObj(req.body, 'userName', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
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
  const user = await User.findById(req.params.id);
  handleNotFound(user, 'User');

  // Najít tenanta a odstranit uživatele ze seznamu uživatelů
  const tenantId = user.tenants[0];
  if (tenantId) {
    const tenant = await Tenant.findOne({ tenantId });
    if (tenant) {
      tenant.users.pull(user._id);
      await tenant.save();
    }
  }

  // Smazat uživatele
  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
