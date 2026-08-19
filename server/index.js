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

// Enable trust proxy for Render / Vercel reverse proxies
app.set('trust proxy', 1);

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet: Set security headers allowing cross-origin API calls
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS: Support localhost, Vercel preview/production domains & custom domain
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === FRONTEND_URL ||
      origin.includes('localhost') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('github.io')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate Limiting: Prevent brute force attacks
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 min
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Max 20 attempts per 15 minutes
  message: { success: false, error: 'Too many login attempts, please try again later.' },
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Karan 3D Portfolio Backend API is Live & Operational 🚀',
    endpoints: {
      health: '/api/health',
      portfolio: '/api/portfolio'
    }
  });
});

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server backend running on 0.0.0.0:${PORT}`);
    console.log(`🔒 Security: CORS enabled for ${FRONTEND_URL}`);
  });
}

startServer();
