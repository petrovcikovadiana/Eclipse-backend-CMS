const Config = require('../models/configModel');
const configController = require('../controllers/configController');
const handleNotFound = require('../utils/handleNotFound');

jest.mock('../models/configModel');
jest.mock('../utils/handleNotFound');

describe('configController', () => {
  describe('getAllConfigs', () => {
    it('should return all configs', async () => {
      const configs = [{ config_key: 'key1', config_value: 'value1' }];
      Config.find.mockResolvedValue(configs);

      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await configController.getAllConfigs(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: configs.length,
        data: { configs },
      });
    });
  });

  describe('getConfig', () => {
    it('should return a config by key', async () => {
      const config = { config_key: 'key1', config_value: 'value1' };
      Config.findOne.mockResolvedValue(config);
      handleNotFound.mockImplementation((entity) => entity);

      const req = { params: { config_key: 'key1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await configController.getConfig(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { config },
      });
    });
  });

  describe('createConfig', () => {
    it('should create a new config', async () => {
      const newConfig = { config_key: 'key1', config_value: 'value1' };
      Config.create.mockResolvedValue(newConfig);

      const req = { body: newConfig };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await configController.createConfig(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { config: newConfig },
      });
    });
  });

  describe('updateConfig', () => {
    it('should update a config by key', async () => {
      const config = { config_key: 'key1', config_value: 'updatedValue' };
      Config.findOneAndUpdate.mockResolvedValue(config);
      handleNotFound.mockImplementation((entity) => entity);

      const req = {
        params: { config_key: 'key1' },
        body: { config_value: 'updatedValue' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await configController.updateConfig(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { config },
      });
    });
  });

  describe('deleteConfig', () => {
    it('should delete a config by key', async () => {
      const config = { config_key: 'key1', config_value: 'value1' };
      Config.findOneAndDelete.mockResolvedValue(config);
      handleNotFound.mockImplementation((entity) => entity);

      const req = { params: { config_key: 'key1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await configController.deleteConfig(req, res, next);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });
  });
});
