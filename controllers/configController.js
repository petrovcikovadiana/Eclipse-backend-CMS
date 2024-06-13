const Config = require('../models/configModel');
const catchAsync = require('../utils/catchAsync');
const handleNotFound = require('../utils/handleNotFound');

// Retrieve all configurations for a specific tenant
exports.getAllConfigs = catchAsync(async (req, res, next) => {
  const configs = await Config.find({ tenant: req.params.tenantId });
  res.status(200).json({
    status: 'success',
    results: configs.length,
    data: {
      configs,
    },
  });
});

// Retrieve a specific configuration by key
exports.getConfig = catchAsync(async (req, res, next) => {
  const config = await Config.findOne({
    config_key: req.params.config_key,
    tenant: req.params.tenantId,
  });
  handleNotFound(config, 'Configuration');

  res.status(200).json({
    status: 'success',
    data: {
      config,
    },
  });
});

// Create a new configuration for a specific tenant
exports.createConfig = catchAsync(async (req, res, next) => {
  const newConfig = await Config.create({
    ...req.body,
    tenant: req.params.tenantId,
  });
  res.status(201).json({
    status: 'success',
    data: {
      config: newConfig,
    },
  });
});

// Update an existing configuration
exports.updateConfig = catchAsync(async (req, res, next) => {
  const config = await Config.findOneAndUpdate(
    { config_key: req.params.config_key, tenant: req.params.tenantId },
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

// Delete a configuration
exports.deleteConfig = catchAsync(async (req, res, next) => {
  const config = await Config.findOneAndDelete({
    config_key: req.params.config_key,
    tenant: req.params.tenantId,
  });
  handleNotFound(config, 'Configuration');

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
