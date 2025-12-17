const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const trackingRoutes = require('./routes/tracking');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { createAdmin } = require('./utils/createAdmin');

const app = express();

// Trust proxy for rate limiting (development environment)
app.set('trust proxy', 1);

// Security middleware (optimized for Vercel)
app.use(helmet({
  contentSecurityPolicy: false, // Disable heavy CSP for better performance
  crossOriginEmbedderPolicy: false
}));

// CORS configuration with multiple origins support
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

console.log('🔐 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log('🌍 Request from origin:', origin);
    
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('❌ Origin not allowed:', origin);
      return callback(null, false);
    }
    console.log('✅ Origin allowed:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));

// Global rate limiter - more restrictive
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 100 requests per 15 min
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: process.env.NODE_ENV === 'development' ? (req) => req.ip === '127.0.0.1' || req.ip === '::1' : undefined
});

app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 5,
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: process.env.NODE_ENV === 'development' ? (req) => req.ip === '127.0.0.1' || req.ip === '::1' : undefined
});

// Tracking endpoints rate limiter - more lenient
const trackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 tracking events per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many tracking requests'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Body parsing middleware (reduced limits for Vercel)
app.use(express.json({ limit: '1mb' })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Handle OPTIONS requests for CORS preflight
app.options('*', cors());

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Purcmium API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products',
      auth: '/api/auth',
      admin: '/api/admin',
      tracking: '/api/track'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Purcmium API is running',
    timestamp: new Date().toISOString()
  });
});

// Admin reset endpoint (for development/debugging only)
app.get('/reset-admin', async (req, res) => {
  try {
    const Admin = require('./models/Admin');
    
    // Delete existing admin
    await Admin.deleteMany({});
    console.log('🗑️ Deleted all admin accounts');
    
    // Create new admin
    await createAdmin();
    
    res.status(200).json({
      success: true,
      message: 'Admin account reset successfully. Use credentials from environment variables to login.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Reset admin error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API routes (always use /api prefix)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/track', trackingLimiter, trackingRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: 'API endpoint not found'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Database connection - MongoDB Atlas only
const connectDB = async () => {
  const atlasUri = process.env.MONGODB_ATLAS_URI;
  
  if (!atlasUri) {
    console.error('❌ MONGODB_ATLAS_URI not found in environment variables');
    console.log('💡 Please set your MongoDB Atlas connection string in .env file');
    process.exit(1);
  }
  
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log('🌐 Database: purcmium (Atlas Cloud)');
    
    // Optimized for Vercel serverless (low memory, fast connections)
    const conn = await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 5000, // Faster timeout for serverless
      socketTimeoutMS: 10000, // Reduced socket timeout
      bufferCommands: false,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 3, // Smaller pool for serverless (saves memory)
      minPoolSize: 1, // Minimal connections
      maxIdleTimeMS: 10000, // Close idle connections faster
      connectTimeoutMS: 5000, // Quick connection timeout
    });
    
    console.log(`✅ MongoDB Atlas Connected Successfully!`);
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`💾 Database: ${conn.connection.name}`);
    console.log(`🔗 All data will persist in MongoDB Atlas`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
    // Don't call createAdmin here for serverless (called separately in ensureDBConnection)
    if (require.main === module) {
      await createAdmin();
    }
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check your Atlas username and password');
    } else if (error.message.includes('network')) {
      console.log('💡 Check your internet connection and Atlas network access');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Atlas connection timeout - check network settings');
    }
    
    console.log('🔧 Troubleshooting steps:');
    console.log('   1. Verify Atlas credentials in .env file');
    console.log('   2. Check Atlas cluster is running');
    console.log('   3. Verify IP whitelist in Atlas (try 0.0.0.0/0 for testing)');
    console.log('   4. Test internet connectivity');
    
    process.exit(1);
  }
};

// Start server (only for local development)
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Purcmium server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  
  await mongoose.connection.close();
  console.log('✅ Server shutdown complete');
  process.exit(0);
});

// Prevent memory leaks
process.setMaxListeners(15);

// Only start server if not in Vercel (serverless)
if (require.main === module) {
  startServer().catch(console.error);
}

// For Vercel serverless - connect to DB on first request
let dbConnected = false;
let adminCreated = false;

const ensureDBConnection = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  // Ensure admin is created after DB connection
  if (!adminCreated) {
    await createAdmin();
    adminCreated = true;
  }
};

// Wrap app to ensure DB connection for serverless
const handler = async (req, res) => {
  await ensureDBConnection();
  return app(req, res);
};

module.exports = handler;

