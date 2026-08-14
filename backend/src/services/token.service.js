const crypto = require('crypto');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateOpaqueToken(size = 32) {
  const token = crypto.randomBytes(size).toString('hex');
  return {
    token,
    hashedToken: hashToken(token),
  };
}

module.exports = {
  hashToken,
  generateOpaqueToken,
};
