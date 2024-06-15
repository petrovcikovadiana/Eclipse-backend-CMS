const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const attachTenantId = require('../utils/tokenExtraction'); // Aktualizace importu

const router = express.Router(); // Correct function is Router, not router

router.post('/signup', authController.protect, authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.get('/checkToken', authController.checkToken);

router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(authController.protect, userController.createUser);

router
  .route('/tenant')
  .get(
    attachTenantId,
    authController.protect,
    userController.getAllTenantUsers,
  );

router
  .route('/:id')
  .get(authController.protect, userController.getUser)
  .patch(authController.protect, userController.updateUser)
  .delete(authController.protect, userController.deleteUser);

// Invite user to tenant
router.post(
  '/invite',
  attachTenantId,
  authController.protect,
  userController.inviteUser,
);

module.exports = router;
