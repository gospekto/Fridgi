const jwt = require('jsonwebtoken');
const config = require('../config');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    config.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    config.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
