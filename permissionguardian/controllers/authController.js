/**
 * authController.js
 * 
 * Auth controller handling register, login, logout, me, forgot password, and reset password
 * with standardized success/error wrappers.
 */

const crypto = require('node:crypto');
const axios = require('axios');
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
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide a valid name.'
        }
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide a valid email address.'
        }
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passwords do not match.'
        }
      });
    }

    const passValidation = validatePasswordStrength(password);
    if (!passValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'VALIDATION_ERROR',
          message: passValidation.message
        }
      });
    }

    const user = await userStore.createUser({ name, email, password });
    const token = generateToken(user);
    const cookieOpts = getAuthCookieOptions();

    res.cookie('privy_auth_token', token, cookieOpts);

    return res.status(201).json({
      success: true,
      data: {
        message: 'Account created successfully.',
        user,
        token
      }
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const errCode = statusCode === 409 ? 'VALIDATION_ERROR' : 'AUTHENTICATION_FAILED';
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errCode,
        message: err.message || 'Unable to complete registration request.'
      }
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
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email or password.'
        }
      });
    }

    const normEmail = email.trim().toLowerCase();
    const user = userStore.findByEmail(normEmail);

    if (!user) {
      userStore.recordFailedAttempt(ip, normEmail);
      return res.status(401).json({ 
        success: false, 
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Invalid email or password.'
        }
      });
    }

    const isMatch = await userStore.verifyPassword(user, password);
    if (!isMatch) {
      userStore.recordFailedAttempt(ip, normEmail);
      return res.status(401).json({ 
        success: false, 
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Invalid email or password.'
        }
      });
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
      success: true,
      data: {
        message: 'Authentication successful.',
        user: safeUser,
        token
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Unable to complete request.'
      }
    });
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.clearCookie('privy_auth_token', { path: '/' });
  return res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully.'
    }
  });
}

/**
 * GET /api/auth/me
 */
function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Unauthenticated.'
      }
    });
  }

  const user = userStore.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: {
        code: 'VALIDATION_ERROR',
        message: 'User not found.'
      }
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      user: userStore.sanitizeUser(user)
    }
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
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'If an account exists with this email address, a password reset link has been sent.'
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Unable to complete request.'
      }
    });
  }
}

/**
 * POST /api/auth/reset-password
 */
async function resetPassword(req, res) {
  try {
    const { email, token, newPassword, confirmPassword } = req.body || {};

    if (!isValidEmail(email) || !token || typeof token !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid or expired password reset token.'
        }
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passwords do not match.'
        }
      });
    }

    const passValidation = validatePasswordStrength(newPassword);
    if (!passValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'VALIDATION_ERROR',
          message: passValidation.message
        }
      });
    }

    const success = await userStore.verifyAndUseResetToken(email, token, newPassword);
    if (!success) {
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid or expired password reset token.'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Password reset successfully. You can now log in with your new password.'
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Unable to complete request.'
      }
    });
  }
}

/**
 * POST /api/auth/google
 * Cryptographically verifies Google OAuth tokens (ID token, Access token, or Authorization code)
 * via official Google APIs and establishes the authenticated Veilix session.
 */
async function googleAuth(req, res) {
  try {
    const { credential, token, code, redirectUri } = req.body || {};
    let email = null;
    let name = null;
    let googleId = null;
    let picture = null;

    // 1. If Google Authorization Code is provided (Authorization Code Flow)
    if (code && typeof code === 'string') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      try {
        const tokenParams = new URLSearchParams();
        tokenParams.append('code', code);
        tokenParams.append('client_id', clientId || '');
        if (clientSecret) {
          tokenParams.append('client_secret', clientSecret);
        }
        tokenParams.append('redirect_uri', redirectUri || 'postmessage');
        tokenParams.append('grant_type', 'authorization_code');

        const tokenExchangeRes = await axios.post('https://oauth2.googleapis.com/token', tokenParams.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000
        });

        const { access_token, id_token } = tokenExchangeRes.data || {};

        if (id_token) {
          const verifyRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`, {
            timeout: 10000
          });
          const payload = verifyRes.data;
          if (payload.email_verified !== true && payload.email_verified !== 'true') {
            return res.status(401).json({
              success: false,
              error: { code: 'AUTHENTICATION_FAILED', message: 'Google account email is not verified.' }
            });
          }
          email = payload.email;
          name = payload.name || payload.email.split('@')[0];
          googleId = payload.sub;
          picture = payload.picture;
        } else if (access_token) {
          const userinfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
            timeout: 10000
          });
          const payload = userinfoRes.data;
          if (payload.email_verified !== true && payload.email_verified !== 'true') {
            return res.status(401).json({
              success: false,
              error: { code: 'AUTHENTICATION_FAILED', message: 'Google account email is not verified.' }
            });
          }
          email = payload.email;
          name = payload.name || payload.email.split('@')[0];
          googleId = payload.sub;
          picture = payload.picture;
        }
      } catch (codeErr) {
        console.error('[Google Code Exchange Error]:', codeErr.response?.data || codeErr.message);
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Failed to exchange authorization code with Google.'
          }
        });
      }
    }
    // 2. If Google ID Token (credential) is provided:
    else if (credential && typeof credential === 'string') {
      try {
        const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
          timeout: 10000
        });
        const payload = googleRes.data;

        // Verify audience if GOOGLE_CLIENT_ID is configured
        const expectedClientId = process.env.GOOGLE_CLIENT_ID;
        if (expectedClientId && payload.aud !== expectedClientId) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'AUTHENTICATION_FAILED',
              message: 'Google authentication token audience mismatch.'
            }
          });
        }

        // Verify email verification status
        if (payload.email_verified !== 'true' && payload.email_verified !== true) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'AUTHENTICATION_FAILED',
              message: 'Google account email is not verified.'
            }
          });
        }

        email = payload.email;
        name = payload.name || payload.email.split('@')[0];
        googleId = payload.sub; // Immutable Google user identifier
        picture = payload.picture;
      } catch (verifyErr) {
        console.error('[Google ID Token Verification Error]:', verifyErr.response?.data || verifyErr.message);
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Invalid or expired Google authentication credential.'
          }
        });
      }
    } 
    // 3. If Google Access Token (token) is provided:
    else if (token && typeof token === 'string') {
      try {
        const userinfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        const payload = userinfoRes.data;

        if (payload.email_verified !== true && payload.email_verified !== 'true') {
          return res.status(401).json({
            success: false,
            error: {
              code: 'AUTHENTICATION_FAILED',
              message: 'Google account email is not verified.'
            }
          });
        }

        email = payload.email;
        name = payload.name || payload.email.split('@')[0];
        googleId = payload.sub;
        picture = payload.picture;
      } catch (tokenErr) {
        console.error('[Google Access Token Verification Error]:', tokenErr.response?.data || tokenErr.message);
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Invalid or expired Google access token.'
          }
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Google OAuth authentication token or credential is required.'
        }
      });
    }

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Could not extract valid identity from Google verification.'
        }
      });
    }

    // Persist or link user in userStore using verified Google sub ID and verified email
    const safeUser = await userStore.findOrCreateGoogleUser({ name, email, googleId, picture });
    const authToken = generateToken(safeUser);
    const cookieOpts = getAuthCookieOptions();

    res.cookie('privy_auth_token', authToken, cookieOpts);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Google authentication successful.',
        user: safeUser,
        token: authToken
      }
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: err.message || 'Unable to complete Google authentication.'
      }
    });
  }
}

/**
 * GET /api/auth/config
 * Returns public authentication configuration (Google OAuth Client ID)
 * dynamically from backend to keep frontend build private and eliminate public framework prefix warnings.
 */
function getAuthConfig(req, res) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
  return res.status(200).json({
    success: true,
    data: {
      googleClientId
    }
  });
}

module.exports = {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  googleAuth,
  getAuthConfig
};

