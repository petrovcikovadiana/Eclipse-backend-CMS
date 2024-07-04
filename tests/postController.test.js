const Post = require('../models/postModel');
const postController = require('../controllers/postController');
const handleNotFound = require('../utils/handleNotFound');
const fs = require('fs').promises;
const path = require('path');

jest.mock('../models/postModel');
jest.mock('../utils/handleNotFound');
jest.mock('fs').promises;

describe('postController', () => {
  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      const posts = [{ title: 'Test Post' }];
      Post.find.mockImplementation(() => ({
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(posts),
      }));
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await postController.getAllPosts(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: posts.length,
        data: { posts },
      });
    });
  });

  describe('getPost', () => {
    it('should return a post by ID', async () => {
      const post = { _id: 'testId', title: 'Test Post' };
      Post.findById.mockResolvedValue(post);
      handleNotFound.mockImplementation((entity) => entity);

      const req = { params: { id: 'testId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await postController.getPost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { post },
      });
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const newPost = { title: 'New Post' };
      Post.create.mockResolvedValue(newPost);

      const req = { body: newPost };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await postController.createPost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { post: newPost },
      });
    });
  });

  describe('updatePost', () => {
    it('should update a post by ID', async () => {
      const post = { _id: 'testId', title: 'Updated Post' };
      Post.findByIdAndUpdate.mockResolvedValue(post);
      handleNotFound.mockImplementation((entity) => entity);

      const req = { params: { id: 'testId' }, body: { title: 'Updated Post' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await postController.updatePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { post },
      });
    });
  });

  describe('deletePost', () => {
    it('should delete a post by ID', async () => {
      const post = { _id: 'testId', title: 'Deleted Post' };
      Post.findByIdAndDelete.mockResolvedValue(post);
      handleNotFound.mockImplementation((entity) => entity);

      const req = { params: { id: 'testId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await postController.deletePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });
  });

  describe('deletePostImage', () => {
    it('should delete a post image', async () => {
      const req = { params: { imageName: 'testImage.avif' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();
      const imagePath = path.join(
        __dirname,
        '..',
        'public',
        'img',
        'posts',
        'testImage.avif',
      );

      fs.access = jest.fn().mockResolvedValue(); // Ensure this returns a promise
      fs.unlink = jest.fn().mockResolvedValue(); // Ensure this returns a promise

      await postController.deletePostImage(req, res, next);
      expect(fs.access).toHaveBeenCalledWith(imagePath);
      expect(fs.unlink).toHaveBeenCalledWith(imagePath);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });
  });
});
