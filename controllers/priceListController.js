const PriceList = require('../models/priceListModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllPriceLists = catchAsync(async (req, res, next) => {
  // Execute query
  const features = new APIFeatures(PriceList.find(), req.query)
    .filter()
    .sort({ order: 1 })
    .limitFields()
    .paginate();
  const priceLists = await features.query;

  res.status(200).json({
    status: 'success',
    results: priceLists.length,
    data: {
      priceLists,
    },
  });
});

// Get pricelist by ID
exports.getPriceList = catchAsync(async (req, res, next) => {
  const priceList = await PriceList.findById(req.params.id);

  if (!priceList) {
    return next(new AppError('No post found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      priceLists: [priceList],
    },
  });
});

// Update pricelist order
exports.updatePriceListOrder = async (req, res) => {
  const { priceLists } = req.body;
  const tenantId = req.tenantId;

  if (!priceLists || !Array.isArray(priceLists)) {
    return res.status(400).json({ error: 'Invalid data format.' });
  }

  try {
    for (let i = 0; i < priceLists.length; i++) {
      await PriceList.updateOne(
        { _id: priceLists[i], tenantId },
        { $set: { order: i } },
      );
    }
    res.status(200).json({ message: 'Order updated successfully.' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order.' });
  }
};

// Create pricelist
exports.createPriceList = catchAsync(async (req, res, next) => {
  try {
    const newPriceList = await PriceList.create({
      tenantId: req.params.tenantId, // Add tenantId
      ...req.body,
    });

    res.status(201).json({
      status: 'success',
      data: {
        priceList: newPriceList,
      },
    });
  } catch (error) {
    console.error('Error in createPriceList:', error);
    next(error);
  }
});

// Update pricelist
exports.updatePriceList = catchAsync(async (req, res, next) => {
  const priceList = await PriceList.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!priceList) {
    return next(new AppError('No PriceList found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      priceLists: [priceList], // A single object in the form of an array
    },
  });
});

// Delete pricelist
exports.deletePriceList = catchAsync(async (req, res, next) => {
  const priceList = await PriceList.findByIdAndDelete(req.params.id);

  if (!priceList) {
    return next(new AppError('No PriceList found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
