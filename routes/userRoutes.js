const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.router();

router.post('/signup', authController.signup.signup);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .router('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
