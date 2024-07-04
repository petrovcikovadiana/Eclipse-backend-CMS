const jwt = require('jsonwebtoken');
const AppError = require('./appError');

module.exports = (req, res, next) => {
  let tenantId;
  let token;

  // Zkuste získat token z hlavičky Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Zkuste získat token z cookies
  if (!token && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Ověřte a dekódujte token
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      tenantId = decoded.tenantId;
    } catch (err) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
  }

  // Zkuste získat tenantId z těla požadavku nebo dotazu
  if (!tenantId) {
    tenantId = req.body.tenantId || req.query.tenantId;
  }

  // Nastavte tenantId do požadavku
  req.tenantId = tenantId;
  next();
};
