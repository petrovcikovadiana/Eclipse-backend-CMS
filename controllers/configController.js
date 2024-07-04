const Config = require('../models/configModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handleNotFound = require('../utils/handleNotFound');

// Retrieve all configurations for a specific tenantId
exports.getAllConfigs = catchAsync(async (req, res, next) => {
  const tenantId = req.tenantId || req.params.tenantId;

  if (!tenantId) {
    return next(new AppError('Tenant ID is required to get configs.', 400));
  }

  const configs = await Config.find({ tenantId });
  res.status(200).json({
    status: 'success',
    results: configs.length,
    data: {
      configs,
    },
  });
});

// Retrieve all configurations without tenantId restriction (for admins)
exports.getAllConfigsWithoutTenant = catchAsync(async (req, res, next) => {
  const configs = await Config.find();
  res.status(200).json({
    status: 'success',
    results: configs.length,
    data: {
      configs,
    },
  });
});

// Retrieve a specific configuration by key
exports.getConfigByKey = catchAsync(async (req, res, next) => {
  const config = await Config.findOne({
    config_key: req.params.config_key,
    tenantId: req.params.tenantId || req.tenantId,
  });
  handleNotFound(config, 'Configuration');

  res.status(200).json({
    status: 'success',
    data: {
      config,
    },
  });
});

// Retrieve a specific configuration by ID
exports.getConfigById = catchAsync(async (req, res, next) => {
  const config = await Config.findById(req.params.id);
  handleNotFound(config, 'Configuration');

  res.status(200).json({
    status: 'success',
    data: {
      config,
    },
  });
});

// Create a new configuration for a specific tenantId
exports.createConfig = catchAsync(async (req, res, next) => {
  const { tenantId, ...configData } = req.body;

  if (!tenantId) {
    return next(new AppError('Tenant ID is required to create a config.', 400));
  }

  const newConfig = await Config.create({
    ...configData,
    tenantId: tenantId,
  });

  res.status(201).json({
    status: 'success',
    data: {
      config: newConfig,
    },
  });
});

// Update an existing configuration by key
exports.updateConfigByKey = catchAsync(async (req, res, next) => {
  const config = await Config.findOneAndUpdate(
    {
      config_key: req.params.config_key,
      tenantId: req.params.tenantId || req.tenantId,
    },
    req.body,
    { new: true },
  );
  handleNotFound(config, 'Configuration');

  res.status(200).json({
    status: 'success',
    data: {
      config,
    },
  });
});

// Update an existing configuration by ID
exports.updateConfigById = catchAsync(async (req, res, next) => {
  const config = await Config.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  handleNotFound(config, 'Configuration');

  res.status(200).json({
    status: 'success',
    data: {
      config,
    },
  });
});

// Delete a configuration by key
exports.deleteConfigByKey = catchAsync(async (req, res, next) => {
  const config = await Config.findOneAndDelete({
    config_key: req.params.config_key,
    tenantId: req.params.tenantId,
  });
  handleNotFound(config, 'Configuration');

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Delete a configuration by ID
exports.deleteConfigById = catchAsync(async (req, res, next) => {
  const config = await Config.findByIdAndDelete(req.params.id);
  handleNotFound(config, 'Configuration');

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
