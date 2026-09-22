/**
 * server.js
 * PermissionGuardian AI - Backend Server with Enterprise Security & Auth
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const analyzeRoutes = require('./routes/analyzeRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Prevents breaking inline scripts/fonts during development
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cookie Parser for HttpOnly Auth Cookies
app.use(cookieParser());

// Rate Limiting Middleware
const requestWindows = new Map();
app.use('/api', (req, res, next) => {
  // Allow health checks and auth status checks without strict rate limiting
  if (req.path === '/health' || req.path === '/auth/me') return next();

  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const isLocal = ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1' || ip === 'localhost';
  const now = Date.now();

  // Prune map if excessively large
  if (requestWindows.size > 1000) {
    const oldestKey = requestWindows.keys().next().value;
    requestWindows.delete(oldestKey);
  }

  const record = requestWindows.get(ip) || { started: now, count: 0 };
  if (now - record.started > 60_000) { 
    record.started = now; 
    record.count = 0; 
  }
  record.count += 1;
  requestWindows.set(ip, record);

  const configuredLimit = Number(process.env.RATE_LIMIT_PER_MINUTE || 2000);
  const limit = isLocal ? Math.max(configuredLimit, 5000) : configuredLimit;

  if (record.count > limit) {
    return res.status(429).json({ 
      success: false, 
      error: { 
        code: 'RATE_LIMIT_EXCEEDED', 
        message: 'Too many requests. Please wait a moment and try again.' 
      },
      message: 'Too many requests. Please wait a moment and try again.' 
    });
  }
  next();
});

// Enable CORS for frontend dev servers & production
const configuredCors = process.env.CORS_ORIGIN;
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (!configuredCors || origin === configuredCors || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, origin);
  },
  credentials: true 
}));

app.use((req, res, next) => { 
  res.setHeader('X-Content-Type-Options', 'nosniff'); 
  res.setHeader('X-Frame-Options', 'DENY'); 
  next(); 
});

// Parse JSON request bodies (supports multi-version app comparison payloads)
app.use(express.json({ limit: process.env.MAX_JSON_LIMIT || '5mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', analyzeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Veilix AI Security API',
    timestamp: new Date().toISOString()
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Endpoint ${req.method} ${req.url} not found.`
  });
});

// Global Error Handler - never leak stack traces
app.use((err, req, res, next) => {
  console.error('[Server Uncaught Error]:', err.stack || err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Unable to complete request.'
    }
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Veilix AI Security Backend listening on port ${PORT}`);
  console.log(`Auth endpoint ready: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`Analyze endpoint ready: POST http://localhost:${PORT}/api/analyze`);
  console.log(`==================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`To fix this:`);
    console.error(`1. Stop any previously running server processes, OR`);
    console.error(`2. Run in PowerShell: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
