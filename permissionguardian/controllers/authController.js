/**
 * authController.js
 * 
 * Auth controller handling register, login, logout, me, forgot password, and reset password.
 */

const crypto = require('node:crypto');
const userStore = require('../services/userStore');
const { 
  isValidEmail, 
  validatePasswordStrength, 
  generateToken, 
  getAuthCookieOptions 
} = require('../services/authService');

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: true, message: 'Please provide a valid name.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: true, message: 'Please provide a valid email address.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: true, message: 'Passwords do not match.' });
    }

    const passValidation = validatePasswordStrength(password);
    if (!passValidation.isValid) {
      return res.status(400).json({ error: true, message: passValidation.message });
    }

    const user = await userStore.createUser({ name, email, password });
    const token = generateToken(user);
    const cookieOpts = getAuthCookieOptions();

    res.cookie('privy_auth_token', token, cookieOpts);

    return res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      user,
      token // Return token so non-cookie HTTP clients can also authenticate
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      error: true,
      message: err.message || 'Unable to complete registration request.'
    });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const { email, password, rememberMe } = req.body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: true, message: 'Invalid email or password.' });
    }

    const normEmail = email.trim().toLowerCase();
    const user = userStore.findByEmail(normEmail);

    if (!user) {
      userStore.recordFailedAttempt(ip, normEmail);
      return res.status(401).json({ error: true, message: 'Invalid email or password.' });
    }

    const isMatch = await userStore.verifyPassword(user, password);
    if (!isMatch) {
      userStore.recordFailedAttempt(ip, normEmail);
      return res.status(401).json({ error: true, message: 'Invalid email or password.' });
    }

    // Success - clear failed login count
    userStore.clearFailedAttempts(ip, normEmail);

    const safeUser = userStore.sanitizeUser(user);
    const token = generateToken(safeUser);
    const cookieOpts = getAuthCookieOptions();

    if (rememberMe) {
      cookieOpts.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    res.cookie('privy_auth_token', token, cookieOpts);

    return res.status(200).json({
      status: 'success',
      message: 'Authentication successful.',
      user: safeUser,
      token
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: 'Unable to complete request.'
    });
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.clearCookie('privy_auth_token', { path: '/' });
  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.'
  });
}

/**
 * GET /api/auth/me
 */
function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: true, message: 'Unauthenticated.' });
  }

  const user = userStore.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: true, message: 'User not found.' });
  }

  return res.status(200).json({
    status: 'success',
    user: userStore.sanitizeUser(user)
  });
}

/**
 * POST /api/auth/forgot-password
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};

    if (isValidEmail(email)) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await userStore.storeResetToken(email, rawToken);
      // In production, an email service sends rawToken link
    }

    // Always return generic response to prevent account enumeration
    return res.status(200).json({
      status: 'success',
      message: 'If an account exists with this email address, a password reset link has been sent.'
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: 'Unable to complete request.' });
  }
}

/**
 * POST /api/auth/reset-password
 */
async function resetPassword(req, res) {
  try {
    const { email, token, newPassword, confirmPassword } = req.body || {};

    if (!isValidEmail(email) || !token || typeof token !== 'string') {
      return res.status(400).json({ error: true, message: 'Invalid or expired password reset token.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: true, message: 'Passwords do not match.' });
    }

    const passValidation = validatePasswordStrength(newPassword);
    if (!passValidation.isValid) {
      return res.status(400).json({ error: true, message: passValidation.message });
    }

    const success = await userStore.verifyAndUseResetToken(email, token, newPassword);
    if (!success) {
      return res.status(400).json({ error: true, message: 'Invalid or expired password reset token.' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: 'Unable to complete request.' });
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword
};
