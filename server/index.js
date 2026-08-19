import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/karan_portfolio';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet: Set various HTTP headers for security
app.use(helmet());

// CORS: Restrict to specific origins only
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate Limiting: Prevent brute force attacks
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

app.use(generalLimiter);

// ============================================================
// BODY PARSER & VALIDATION
// ============================================================

// Parse JSON with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================================
// ROUTES
// ============================================================

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Portfolio Backend Server Running',
    timestamp: new Date().toISOString()
  });
});

// Apply stricter rate limit to auth routes
app.use('/api/auth', authLimiter);

// API Routes
app.use('/api', apiRoutes);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// ============================================================
// DATABASE & SERVER INITIALIZATION
// ============================================================

async function startServer() {
  try {
    // Don't log the URI with credentials
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB Database Connected Successfully!');
  } catch (error) {
    console.warn('⚠️ MongoDB Connection Notice:', error.message);
    console.warn('⚠️ Server will run with local fallback if database service is starting or offline.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server backend running on http://localhost:${PORT}`);
    console.log(`🔒 Security: CORS enabled for ${FRONTEND_URL}`);
    console.log(`🔒 Security: Rate limiting active (100 req/15min, auth: 5 req/15min)`);
  });
}

startServer();
