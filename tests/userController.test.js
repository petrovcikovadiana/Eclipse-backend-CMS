const User = require('../models/userModel');
const userController = require('../controllers/userController');
const handleNotFound = require('../utils/handleNotFound');

jest.mock('../models/userModel');
jest.mock('../utils/handleNotFound');

describe('userController', () => {
  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ username: 'Test User' }];
      User.find.mockResolvedValue(users);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await userController.getAllUsers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: users.length,
        data: { users },
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = { username: 'New User' };
      User.create.mockResolvedValue(newUser);

      const req = { body: newUser };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await userController.createUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: newUser },
      });
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const user = { _id: 'testId', username: 'Test User' };
      User.findById.mockResolvedValue(user);
      handleNotFound.mockImplementation((entity) => entity);

      const req = { params: { id: 'testId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await userController.getUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user },
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user by ID', async () => {
      const user = { _id: 'testId', username: 'Updated User' };
      User.findByIdAndUpdate.mockResolvedValue(user);
      handleNotFound.mockImplementation((entity) => entity);

      const req = {
        params: { id: 'testId' },
        body: { username: 'Updated User' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await userController.updateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user },
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      const user = { _id: 'testId', username: 'Deleted User' };
      User.findByIdAndDelete.mockResolvedValue(user);
      handleNotFound.mockImplementation((entity) => entity);

      const req = { params: { id: 'testId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await userController.deleteUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });
  });
});
