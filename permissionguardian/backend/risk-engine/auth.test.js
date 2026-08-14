/**
 * auth.test.js
 * 
 * Automated unit test suite for PermissionGuardian AI Authentication & Security System.
 */

const assert = require('node:assert');
const userStore = require('../../services/userStore');
const { 
  isValidEmail, 
  validatePasswordStrength, 
  generateToken, 
  verifyToken 
} = require('../../services/authService');

console.log('==================================================');
console.log(' RUNNING PRIVACY GUARDIAN AUTHENTICATION TEST SUITE');
console.log('==================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAsyncTest(description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAllTests() {

  // ── TEST GROUP 1: INPUT VALIDATION ──────────────────────────────────────────
  console.log('--- TEST GROUP 1: Input & Password Validation ---');

  test('Validates RFC 5322 email formats', () => {
    assert.strictEqual(isValidEmail('user@example.test'), true);
    assert.strictEqual(isValidEmail('invalid-email'), false);
    assert.strictEqual(isValidEmail(''), false);
    assert.strictEqual(isValidEmail('a'.repeat(250) + '@test.com'), false);
  });

  test('Enforces strict password complexity rules - valid pass', () => {
    const res = validatePasswordStrength('Admin@123456');
    assert.strictEqual(res.isValid, true, res.message);
  });

  test('Enforces strict password complexity rules - short pass', () => {
    assert.strictEqual(validatePasswordStrength('weak').isValid, false);
  });

  test('Enforces strict password complexity rules - missing uppercase', () => {
    assert.strictEqual(validatePasswordStrength('nouppercase@123').isValid, false);
  });

  test('Enforces strict password complexity rules - missing lowercase', () => {
    assert.strictEqual(validatePasswordStrength('NOLOWERCASE@123').isValid, false);
  });

  test('Enforces strict password complexity rules - missing number', () => {
    assert.strictEqual(validatePasswordStrength('NoNumberSpecial@').isValid, false);
  });

  test('Enforces strict password complexity rules - missing special char', () => {
    assert.strictEqual(validatePasswordStrength('NoSpecialChar123').isValid, false);
  });


  // ── TEST GROUP 2: BCRYPT HASHING & USER STORE ────────────────────────────────
  console.log('\n--- TEST GROUP 2: Password Hashing & User Management ---');

  await runAsyncTest('Verifies default demo admin account', async () => {
    const admin = userStore.findByEmail('demo@example.invalid');
    assert(admin !== null, 'Admin account must exist');
    const isMatch = await userStore.verifyPassword(admin, 'Admin@123456');
    assert.strictEqual(isMatch, true, 'Demo admin password must match');
  });

  await runAsyncTest('Creates user with bcrypt hashed password', async () => {
    const newUser = await userStore.createUser({
      name: 'Test Analyst',
      email: 'analyst@sec.org',
      password: 'SecurePass@2026'
    });
    assert.strictEqual(newUser.name, 'Test Analyst');
    assert.strictEqual(newUser.email, 'analyst@sec.org');

    const storedUser = userStore.findByEmail('analyst@sec.org');
    assert(storedUser.passwordHash.startsWith('$2a$') || storedUser.passwordHash.startsWith('$2b$'));
    assert.strictEqual(storedUser.passwordHash.includes('SecurePass@2026'), false);
  });

  await runAsyncTest('Rejects duplicate registration emails', async () => {
    await assert.rejects(async () => {
      await userStore.createUser({
        name: 'Duplicate Analyst',
        email: 'analyst@sec.org',
        password: 'SecurePass@2026'
      });
    }, /already exists/);
  });


  // ── TEST GROUP 3: JWT TOKEN ISSUANCE & VERIFICATION ────────────────────────
  console.log('\n--- TEST GROUP 3: JWT & Cookie Tokens ---');

  test('Issues and verifies signed JWT tokens', () => {
    const payload = { id: 'usr_123', email: 'test@sec.org', name: 'Test', role: 'user' };
    const token = generateToken(payload);
    assert(typeof token === 'string' && token.length > 20);

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.email, 'test@sec.org');
    assert.strictEqual(decoded.role, 'user');
  });

  test('Rejects tampered JWT tokens', () => {
    const token = generateToken({ id: 'usr_123' });
    const tampered = token.slice(0, -5) + 'xxxxx';
    const decoded = verifyToken(tampered);
    assert.strictEqual(decoded, null);
  });


  // ── TEST GROUP 4: BRUTE-FORCE RATE LIMITING & LOCKOUT ──────────────────────
  console.log('\n--- TEST GROUP 4: Brute-Force Rate Limiting & Lockout ---');

  test('Locks account after 5 consecutive failed login attempts', () => {
    const testIp = '192.168.1.100';
    const testEmail = 'victim@sec.org';

    assert.strictEqual(userStore.getLockoutStatus(testIp, testEmail).isLocked, false);

    for (let i = 1; i <= 4; i++) {
      userStore.recordFailedAttempt(testIp, testEmail);
      assert.strictEqual(userStore.getLockoutStatus(testIp, testEmail).isLocked, false);
    }

    // 5th failed attempt triggers 15-min lockout
    userStore.recordFailedAttempt(testIp, testEmail);
    const lockout = userStore.getLockoutStatus(testIp, testEmail);
    assert.strictEqual(lockout.isLocked, true);
    assert(lockout.remainingSeconds > 800);

    userStore.clearFailedAttempts(testIp, testEmail);
  });

  console.log('\n==================================================');
  console.log(` AUTH TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('==================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
