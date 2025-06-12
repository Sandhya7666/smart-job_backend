// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("🚀 ~ authenticateToken ~ authHeader:", authHeader)
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  console.log("🚀 ~ authenticateToken ~ token:", token)

  if (!token) {
    return res.status(401).json({ status: false, message: 'Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ status: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
