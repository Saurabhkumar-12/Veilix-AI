/**
 * authMiddleware.js
 * 
 * Middleware for Protected Routes & Login Rate Limiting.
 */

const { verifyToken } = require('../services/authService');
const { getLockoutStatus } = require('../services/userStore');

/**
 * Middleware to protect routes that require authentication
 */
function requireAuth(req, res, next) {
  // 1. Try reading token from HttpOnly cookie
  let token = req.cookies?.privy_auth_token;

  // 2. Fallback to Authorization Header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required. Please log in to access this security workspace.'
      },
      message: 'Authentication required. Please log in to access this security workspace.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_SESSION',
        message: 'Session expired or invalid token. Please log in again.'
      },
      message: 'Session expired or invalid token. Please log in again.'
    });
  }

  req.user = decoded;
  next();
}

/**
 * Middleware for login brute force protection
 */
function checkLoginLockout(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const email = req.body?.email || '';

  if (email) {
    const status = getLockoutStatus(ip, email);
    if (status.isLocked) {
      const waitTime = Math.ceil(status.remainingSeconds / 60);
      const msg = `Too many failed login attempts. Account temporarily locked for security. Please try again in ${waitTime} minute(s).`;
      return res.status(429).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: msg,
          remainingSeconds: status.remainingSeconds
        },
        message: msg
      });
    }
  }

  next();
}

module.exports = {
  requireAuth,
  checkLoginLockout
};
