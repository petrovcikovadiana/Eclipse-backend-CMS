const jwt = require('jsonwebtoken');
const AppError = require('./appError');

module.exports = (req, res, next) => {
  let tenantId;
  let token;

  // Extraction token from header authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Extraction token from cookies
  if (!token && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Validate and decode token
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      tenantId = decoded.tenantId;
    } catch (err) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
  }

  // Extraction tenantId from body or request query or params
  if (!tenantId) {
    tenantId = req.body.tenantId || req.query.tenantId || req.params.tenantId;
  }

  // Add tenantId to request
  if (tenantId) {
    req.tenantId = tenantId;
    req.body.tenantId = tenantId; // Add to body request
  }
  next();
};
