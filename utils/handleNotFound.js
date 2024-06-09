const AppError = require('./appError');

const handleNotFound = (entity, entityName) => {
  if (!entity) {
    throw new AppError(`${entityName} not found`, 404);
  }
  return entity;
};

module.exports = handleNotFound;
