/**
 * userStore.js
 * 
 * Secure User Store for PermissionGuardian AI.
 * Handles password hashing (bcryptjs), lockout tracking, and token storage.
 */

const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');

// In-memory user database
const usersByEmail = new Map();
const usersById = new Map();
const failedLogins = new Map(); // ip:email -> { count, lockedUntil }

/**
 * Initializes a local demonstration account synchronously.
 */
function initUserStoreSync() {
  const demoEmail = 'demo@example.invalid';
  if (!usersByEmail.has(demoEmail)) {
    const hashedPassword = bcrypt.hashSync('Admin@123456', 12);
    const demoUser = {
      id: 'usr_demo_admin_001',
      name: 'Security Admin',
      email: demoEmail,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
      role: 'admin'
    };
    usersByEmail.set(demoEmail, demoUser);
    usersById.set(demoUser.id, demoUser);
  }
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
  const record = failedLogins.get(key) || { count: 0, lockedUntil: null };

  record.count += 1;

  if (record.count >= 5) {
    // Exponential lockout: 15 minutes
    record.lockedUntil = now + (15 * 60 * 1000);
  }

  failedLogins.set(key, record);
}

function clearFailedAttempts(ip, email) {
  const key = `${ip}:${email.toLowerCase()}`;
  failedLogins.delete(key);
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
  verifyAndUseResetToken
};
