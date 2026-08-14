const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  me, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const { requireAuth, checkLoginLockout } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', checkLoginLockout, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
