/**
 * userStore.js
 * 
 * Secure User Store for PermissionGuardian AI.
 * Handles password hashing (bcryptjs), lockout tracking, and token storage.
 */

const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');

const fs = require('node:fs');
const path = require('node:path');

// User database maps
const usersByEmail = new Map();
const usersById = new Map();
const failedLogins = new Map(); // ip:email -> { count, lockedUntil }

const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Ensures data directory and persists user data to disk.
 */
function persistUsersToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const userArray = Array.from(usersByEmail.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(userArray, null, 2), 'utf-8');
  } catch (err) {
    console.error('[UserStore Persistence Error]:', err.message);
  }
}

/**
 * Initializes default demo accounts and loads saved users from disk.
 */
function initUserStoreSync() {
  // Load saved users if available
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const savedUsers = JSON.parse(data);
      if (Array.isArray(savedUsers)) {
        for (const u of savedUsers) {
          if (u.email && u.id) {
            usersByEmail.set(u.email.toLowerCase(), u);
            usersById.set(u.id, u);
          }
        }
      }
    }
  } catch (err) {
    console.error('[UserStore Load Error]:', err.message);
  }

  // Pre-seed standard demo accounts
  const demoAccounts = [
    { email: 'demo@veilix.ai', name: 'Demo Security Analyst', pass: 'Admin@123456', role: 'admin' },
    { email: 'admin@veilix.ai', name: 'Veilix Administrator', pass: 'Admin@123456', role: 'admin' },
    { email: 'analyst@veilix.ai', name: 'Lead App Auditor', pass: 'Admin@123456', role: 'user' },
    { email: 'demo@example.invalid', name: 'Demo User', pass: 'Admin@123456', role: 'admin' },
    { email: 'user@veilix.ai', name: 'Security Researcher', pass: 'Admin@123456', role: 'user' }
  ];

  for (const acc of demoAccounts) {
    const norm = acc.email.toLowerCase();
    if (!usersByEmail.has(norm)) {
      const hashedPassword = bcrypt.hashSync(acc.pass, 12);
      const userObj = {
        id: `usr_${crypto.randomUUID()}`,
        name: acc.name,
        email: norm,
        passwordHash: hashedPassword,
        createdAt: new Date().toISOString(),
        role: acc.role
      };
      usersByEmail.set(norm, userObj);
      usersById.set(userObj.id, userObj);
    }
  }

  persistUsersToDisk();
  failedLogins.clear();
}

// Synchronous initialization
initUserStoreSync();

function findByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  return usersByEmail.get(email.trim().toLowerCase()) || null;
}

function findById(id) {
  if (!id || typeof id !== 'string') return null;
  return usersById.get(id) || null;
}

async function createUser({ name, email, password }) {
  const normEmail = email.trim().toLowerCase();
  if (usersByEmail.has(normEmail)) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  // Guard against memory exhaustion by capping registered users in this in-memory Map
  if (usersByEmail.size >= 1000) {
    const err = new Error('System registration limit reached for this demonstration instance.');
    err.statusCode = 503;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    id: `usr_${crypto.randomUUID()}`,
    name: name.trim(),
    email: normEmail,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString(),
    role: 'user'
  };

  usersByEmail.set(normEmail, user);
  usersById.set(user.id, user);

  persistUsersToDisk();

  return sanitizeUser(user);
}

async function verifyPassword(user, candidatePassword) {
  if (!user || !user.passwordHash) return false;
  return bcrypt.compare(candidatePassword, user.passwordHash);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, resetTokenHash, resetTokenExpires, ...safe } = user;
  return safe;
}

// Brute-force & Lockout tracking
function getLockoutStatus(ip, email) {
  const key = `${ip}:${email.toLowerCase()}`;
  const record = failedLogins.get(key);
  if (!record) return { isLocked: false, remainingSeconds: 0 };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      isLocked: true,
      remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000)
    };
  }

  // Lockout expired
  if (record.lockedUntil && record.lockedUntil <= now) {
    failedLogins.delete(key);
  }

  return { isLocked: false, remainingSeconds: 0 };
}

function recordFailedAttempt(ip, email) {
  const key = `${ip}:${email.toLowerCase()}`;
  const now = Date.now();
  
  // Cap the Map to prevent memory exhaustion (OOM)
  if (failedLogins.size >= 500) {
    const firstKey = failedLogins.keys().next().value;
    failedLogins.delete(firstKey);
  }

  const record = failedLogins.get(key) || { count: 0, lockedUntil: null };

  record.count += 1;

  if (record.count >= 10) {
    // 2-minute lockout for security without permanently locking out user
    record.lockedUntil = now + (2 * 60 * 1000);
  }

  failedLogins.set(key, record);
}

function clearFailedAttempts(ip, email) {
  if (ip && email) {
    const key = `${ip}:${email.toLowerCase()}`;
    failedLogins.delete(key);
  } else {
    failedLogins.clear();
  }
}

// Password Reset Tokens
async function storeResetToken(email, rawToken) {
  const user = findByEmail(email);
  if (!user) return null;

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetTokenHash = tokenHash;
  user.resetTokenExpires = Date.now() + (15 * 60 * 1000); // 15 minutes
  return user;
}

async function verifyAndUseResetToken(email, rawToken, newPassword) {
  const user = findByEmail(email);
  if (!user || !user.resetTokenHash || !user.resetTokenExpires) return false;

  if (Date.now() > user.resetTokenExpires) {
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    return false;
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  if (crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(user.resetTokenHash))) {
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    return true;
  }

  return false;
}

async function findOrCreateGoogleUser({ name, email, googleId, picture }) {
  const normEmail = email ? email.trim().toLowerCase() : '';
  let user = null;

  // CASE 2: Check if user with this immutable Google ID already exists
  if (googleId) {
    for (const u of usersByEmail.values()) {
      if (u.googleId && u.googleId === googleId) {
        user = u;
        break;
      }
    }
  }

  // CASE 3: If not found by googleId, check by verified email
  if (!user && normEmail) {
    user = usersByEmail.get(normEmail);
    if (user) {
      // Link the Google account to existing user
      if (googleId) user.googleId = googleId;
      if (picture && !user.picture) user.picture = picture;
      if (name && (!user.name || user.name === 'Google User')) user.name = name.trim();
    }
  }

  // CASE 1: First-time sign in with Google — create new user account
  if (!user && normEmail) {
    user = {
      id: `usr_${crypto.randomUUID()}`,
      name: name ? name.trim() : normEmail.split('@')[0],
      email: normEmail,
      googleId: googleId || null,
      picture: picture || null,
      createdAt: new Date().toISOString(),
      role: 'user'
    };
    usersByEmail.set(normEmail, user);
    usersById.set(user.id, user);
  }

  if (user) {
    persistUsersToDisk();
  }

  return sanitizeUser(user);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  verifyPassword,
  sanitizeUser,
  getLockoutStatus,
  recordFailedAttempt,
  clearFailedAttempts,
  storeResetToken,
  verifyAndUseResetToken,
  findOrCreateGoogleUser
};

