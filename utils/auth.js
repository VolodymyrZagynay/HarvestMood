const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { UserId: user.UserId, Email: user.Email, Role: user.Role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
}

module.exports = { generateToken };