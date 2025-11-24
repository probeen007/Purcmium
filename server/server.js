const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

// Import MongoDB Memory Server for development
const { MongoMemoryServer } = require('mongodb-memory-server');

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

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (more lenient in development)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 1000 : (process.env.MAX_REQUESTS_PER_MINUTE || 100),
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

// Stricter rate limiting for auth endpoints (more lenient in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // More attempts in development
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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Purcmium API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/track', trackingRoutes);
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
    
    const conn = await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 15000, // Increased timeout for Atlas
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
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
    
    await createAdmin();
    
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

// Start server
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
  
  if (process.mongod) {
    console.log('🧹 Stopping MongoDB Memory Server...');
    await process.mongod.stop();
  }
  
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  
  if (process.mongod) {
    console.log('🧹 Cleaning up MongoDB Memory Server...');
    await process.mongod.stop();
  }
  
  await mongoose.connection.close();
  console.log('✅ Server shutdown complete');
  process.exit(0);
});

startServer().catch(console.error);

module.exports = app;