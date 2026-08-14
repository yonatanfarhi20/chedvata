const jwt = require('jsonwebtoken');
const { getJwtSecret, getJwtExpiresIn } = require('../config/jwt');

function signJwt(payload, options = {}) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
    ...options,
  });
}

function verifyJwt(token) {
  return jwt.verify(token, getJwtSecret());
}

function createAccessToken(user) {
  const id = user.id || user._id;
  const { role } = user;

  if (!id || !role) {
    throw new Error('createAccessToken requires a user with id and role');
  }

  return signJwt({
    id: String(id),
    role,
  });
}

module.exports = {
  signJwt,
  verifyJwt,
  createAccessToken,
};
