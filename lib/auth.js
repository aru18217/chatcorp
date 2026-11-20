const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

function signToken(user) {
  return jwt.sign({ id: String(user._id), role: user.role }, getSecret(), { expiresIn: '7d' });
}

async function userFromToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret());
    return await User.findById(payload.id);
  } catch (e) {
    return null;
  }
}

function readBearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Express middleware: requires a valid, OTP-verified user.
async function requireAuth(req, res, next) {
  const user = await userFromToken(readBearer(req));
  if (!user) return res.status(401).json({ message: 'Please login again.' });
  if (!user.isVerified()) return res.status(403).json({ message: 'Please verify your account with the OTP first.' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  next();
}

module.exports = { signToken, userFromToken, readBearer, requireAuth, requireAdmin };
