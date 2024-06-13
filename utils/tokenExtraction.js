const jwt = require('jsonwebtoken');
const AppError = require('./appError');

module.exports = (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded.tenantId) {
    return next(new AppError('No tenantId found in token.', 401));
  }

  req.tenantId = decoded.tenantId; // Use tenantId directly as string
  next();
};
