const Category = require('../models/categoryModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all categories
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Category.find(), req.query)
    .filter()
    .sort({ order: 1 })
    .limitFields()
    .paginate();
  const categories = await features.query;

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
});

// Get category by ID
exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

// Update order of category
exports.updateCategoryOrder = async (req, res) => {
  const { categories } = req.body;
  const tenantId = req.tenantId;

  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ error: 'Invalid data format.' });
  }

  try {
    for (let i = 0; i < categories.length; i++) {
      await Category.updateOne(
        { _id: categories[i], tenantId },
        { $set: { order: i } },
      );
    }
    res.status(200).json({ message: 'Order updated successfully.' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order.' });
  }
};

// Create new category
exports.createCategory = catchAsync(async (req, res, next) => {
  try {
    const newCategory = await Category.create({
      tenantId: req.params.tenantId,
      ...req.body,
    });

    res.status(201).json({
      status: 'success',
      data: {
        category: newCategory,
      },
    });
  } catch (error) {
    console.error('Error in createCategory:', error);
    next(error);
  }
});

// Update category
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

// Delete category
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
