const express = require('express');
const employeeController = require('../controllers/employeeController');
const authController = require('../controllers/authController');
const attachTenantId = require('../utils/tokenExtraction');

const router = express.Router();

router
  .route('/')
  .get(attachTenantId, employeeController.getAllEmployees)
  .post(
    authController.protect,
    attachTenantId,
    employeeController.uploadEmployeeImg,
    employeeController.resizeEmployeeImg,
    employeeController.createEmployee,
  );

router
  .route('/:id')
  .get(employeeController.getEmployee)
  .patch(
    authController.protect,
    attachTenantId,
    employeeController.uploadEmployeeImg,
    employeeController.resizeEmployeeImg,
    employeeController.updateEmployee,
  )
  .delete(
    authController.protect,
    attachTenantId,
    employeeController.deleteEmployee,
  );

router.delete(
  '/deleteImg/:imageName',
  // authController.protect,
  // attachTenantId,
  employeeController.deleteEmployeeImage,
);
module.exports = router;
