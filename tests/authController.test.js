const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const authController = require('../controllers/authController');
const User = require('../models/userModel');

jest.mock('../models/userModel');
jest.mock('jsonwebtoken');

describe('authController', () => {
  describe('signup', () => {
    it('should create a new user and return a token', async () => {
      const newUser = {
        _id: 'testId',
        username: 'New User',
        email: 'test@example.com',
      };
      User.create.mockResolvedValue(newUser);
      jwt.sign.mockReturnValue('testToken');

      const req = {
        body: {
          ...newUser,
          password: 'password123',
          passwordConfirm: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authController.signup(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        token: 'testToken',
        data: { user: newUser },
      });
    });

    it('should throw an error if passwords do not match', async () => {
      const req = { body: { password: '123456', passwordConfirm: '654321' } };
      const res = {};
      const next = jest.fn();

      await authController.signup(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Passwords do not match');
    });
  });

  describe('login', () => {
    it('should return a token if credentials are correct', async () => {
      const user = {
        _id: 'testId',
        email: 'test@example.com',
        correctPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });
      jwt.sign.mockReturnValue('testToken');

      const req = { body: { email: 'test@example.com', password: 'password' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authController.login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        token: 'testToken',
      });
    });

    it('should throw an error if email or password is missing', async () => {
      const req = { body: { email: '', password: '' } };
      const res = {};
      const next = jest.fn();

      await authController.login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe(
        'Please provide email and password',
      );
    });

    it('should throw an error if credentials are incorrect', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = {
        body: { email: 'test@example.com', password: 'wrongpassword' },
      };
      const res = {};
      const next = jest.fn();

      await authController.login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe('Incorrect email or password');
    });
  });
});
