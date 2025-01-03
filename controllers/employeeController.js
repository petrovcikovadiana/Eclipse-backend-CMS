const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const handleNotFound = require('../utils/handleNotFound');
const Employee = require('../models/employeeModel');
const AppError = require('../utils/appError');

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const multerStorage = multer.memoryStorage();

// Initialize multer with the configured storage and file filter
const upload = multer({
  storage: multer.memoryStorage(), // Add folders to memory
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const sharpConfig = {
  resize: { width: 350, height: 350 },
  format: 'avif',
  options: { quality: 90 },
};

exports.resizeEmployeeImg = catchAsync(async (req, res, next) => {
  // Skip if no file uploaded
  if (!req.file) return next();

  const slug =
    req.body.slug || req.body.name?.toLowerCase().replace(/\s+/g, '-');

  req.file.filename = `employee-${slug}-${Date.now()}.avif`;
  await sharp(req.file.buffer)
    .resize(sharpConfig.resize.width, sharpConfig.resize.height)
    .toFormat(sharpConfig.format)
    .avif(sharpConfig.options)
    .toFile(
      path.join(
        __dirname,
        '..',
        'public',
        'img',
        'employees',
        req.file.filename,
      ),
    );

  req.body.imageName = req.file.filename;

  next();
});

// Update image of employee
exports.uploadEmployeeImg = upload.single('image');

// Get all employees
exports.getAllEmployees = catchAsync(async (req, res, next) => {
  const filter = { tenantId: req.tenantId || req.params.tenantId };
  const features = new APIFeatures(Employee.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const employees = await features.query;

  res.status(200).json({
    status: 'success',
    results: employees.length,
    data: { employees },
  });
});

// Get employee by ID
exports.getEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findOne({
    _id: req.params.id,
    tenantId: req.params.tenantId || req.tenantId,
  });
  if (!employee) {
    return next(new AppError('No employee found with this ID', 404));
  }
  handleNotFound(employee, 'Employee');
  res.status(200).json({
    status: 'success',
    data: { employee },
  });
});

// Create employee
exports.createEmployee = catchAsync(async (req, res, next) => {
  const newEmployee = await Employee.create({
    runValidators: true,
    ...req.body,
    imageName: req.file ? req.file.filename : undefined,
    tenantId: req.params.tenantId || req.tenantId,
  });

  res.status(201).json({
    status: 'success',
    data: { employee: newEmployee },
  });
});

// Update employee
exports.updateEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findOneAndUpdate(
    {
      _id: req.params.id,
      tenantId: req.params.tenantId || req.tenantId,
    },
    req.body,
    {
      new: true,
      runValidators: true, // Validate input data
    },
  );
  res.status(200).json({
    status: 'success',
    data: { employee },
  });

  //   if (!employee) {
  //     return next(new AppError('No employee found with that ID', 404));
  //   }

  //   if (req.file && employee.imageName) {
  //     const oldImagePath = path.join(
  //       __dirname,
  //       '..',
  //       'public',
  //       'img',
  //       'employees',
  //       employee.imageName,
  //     );

  //     try {
  //       await fs.unlink(oldImagePath);
  //     } catch (err) {
  //       console.error('Failed to delete old image:', err);
  //     }
  //   }

  //   const updatedEmployee = await Employee.findOneAndUpdate(
  //     { _id: req.params.id, tenantId: req.params.tenantId || req.tenantId },
  //     {
  //       ...req.body,
  //       imageName: req.file ? req.file.filename : employee.imageName,
  //     },
  //     {
  //       new: true,
  //       runValidators: true,
  //     },
  //   );
});

// Delete employee
exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findOne({
    _id: req.params.id,
    tenantId: req.params.tenantId || req.tenantId,
  });
  if (!employee) {
    return next(new AppError('No employee found with this ID', 404));
  }

  if (employee.imageName) {
    const imagePath = path.join(
      __dirname,
      '..',
      'public',
      'img',
      'employees',
      employee.imageName,
    );

    try {
      await fs.unlink(imagePath);
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }

  await Employee.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Delete employee image
exports.deleteEmployeeImage = catchAsync(async (req, res, next) => {
  const image = req.params.imageName;
  const imagePath = path.join(
    __dirname,
    '..',
    'public',
    'img',
    'employees',
    image,
  );

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
