const jwt = require('jsonwebtoken');
const Tenant = require('../models/tenantModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

// Create a new tenant
exports.createTenant = catchAsync(async (req, res, next) => {
  const { email, ...tenantData } = req.body;

  if (!email) {
    return next(new AppError('Please provide email.', 400));
  }

  // Create tenant
  const tenant = new Tenant(tenantData);
  await tenant.save();

  // Create dummy user for invitation
  const user = await User.create({
    email,
    role: 'manager',
    tenants: [tenant.tenantId],
    isInvite: true,
  });

  // Add the user to the tenant's users array
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

  await new Email(user, signupUrl).sendTenantInvite();

  res.status(201).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

exports.inviteUser = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const tenantId = req.params.tenantId;

  if (!email) {
    return next(new AppError('Please provide email.', 400));
  }

  const user = await User.create({
    email,
    tenants: [tenantId],
    isInvite: true,
  });

  // Find the tenant and add the user to the tenant's users array
  const tenant = await Tenant.findOne({ tenantId });
  tenant.users.push(user._id);
  await tenant.save();

  const token = jwt.sign({ email, tenantId }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
  const signupUrl = `${req.protocol}://${req.get('host')}/signup?token=${token}`;
  await new Email(user, signupUrl).sendTenantInvite();

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Get all tenants
exports.getAllTenants = catchAsync(async (req, res, next) => {
  const tenants = await Tenant.find().populate({
    path: 'users',
    select: 'userName email role',
  });
  res.status(200).json({
    status: 'success',
    results: tenants.length,
    data: {
      tenants,
    },
  });
});

// Get a single tenant by ID
exports.getTenantById = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id).populate({
    path: 'users',
    select: 'userName email role',
  });
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Update a tenant by ID
exports.updateTenant = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate({
    path: 'users',
    select: 'userName email role',
  });
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Delete a tenant by ID
exports.deleteTenant = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findByIdAndDelete(req.params.id).populate({
    path: 'users',
    select: 'userName email role',
  });
  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
