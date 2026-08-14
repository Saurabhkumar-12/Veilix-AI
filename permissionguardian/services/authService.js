/**
 * authService.js
 * 
 * Authentication Service for PermissionGuardian AI.
 * Handles validation, JWT creation, password policy, and token management.
 */

const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const userStore = require('./userStore');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : crypto.randomBytes(48).toString('hex'));
if (!JWT_SECRET) throw new Error('JWT_SECRET must be configured in production.');

/**
 * Validates Email Format & Length
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Enforces Strict Password Complexity Rules:
 * - At least 8 characters
 * - Uppercase letter
 * - Lowercase letter
 * - Number
 * - Special character (non-alphanumeric)
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 128) {
    return { isValid: false, message: 'Password exceeds maximum allowed length.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*...).' };
  }

  return { isValid: true };
}

/**
 * Generates JWT Auth Token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verifies JWT Auth Token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Cookie options for HttpOnly auth cookies
 */
function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };
}

module.exports = {
  isValidEmail,
  validatePasswordStrength,
  generateToken,
  verifyToken,
  getAuthCookieOptions,
  JWT_SECRET
};
