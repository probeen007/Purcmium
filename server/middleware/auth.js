const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { verifyToken } = require('../utils/jwt');

// Protect routes - admin authentication required
const protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔐 Auth check - Cookies:', Object.keys(req.cookies || {}));
    console.log('🔐 Auth check - Authorization header:', req.headers.authorization?.substring(0, 20) + '...');

    // Get token from Authorization header OR cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
      console.log('✅ Token from Authorization header');
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('✅ Token from cookie');
    }

    // Make sure token exists
    if (!token || token === 'none') {
      console.log('❌ No token found in header or cookies');
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Not authorized to access this route'
        }
      });
    }

    console.log('✅ Token found, verifying...');

    try {
      // Verify token
      const decoded = verifyToken(token);
      console.log('✅ Token verified for admin:', decoded.email);
      
      // Get admin from database
      const admin = await Admin.findById(decoded.id);
      
      if (!admin) {
        console.log('❌ Admin not found in database:', decoded.id);
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Not authorized to access this route'
          }
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        console.log('❌ Admin account inactive:', admin.email);
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Account has been deactivated'
          }
        });
      }

      // Check if account is locked
      if (admin.isLocked) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account is temporarily locked due to failed login attempts'
          }
        });
      }

      // Update last activity
      admin.updateLastActivity();

      // Add admin to request object
      req.admin = admin;
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Not authorized to access this route'
        }
      });
    }
    
  } catch (error) {
    next(error);
  }
};

// Check if user is admin (additional check)
const adminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PRIVILEGES',
        message: 'Admin privileges required'
      }
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token, continue without authentication
    if (!token || token === 'none') {
      req.admin = null;
      return next();
    }

    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get admin from database
      const admin = await Admin.findById(decoded.id);
      
      // Add admin to request if valid
      if (admin && admin.isActive && !admin.isLocked) {
        req.admin = admin;
        admin.updateLastActivity();
      } else {
        req.admin = null;
      }
      
    } catch (error) {
      // Token invalid, continue without authentication
      req.admin = null;
    }

    next();
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  adminOnly,
  optionalAuth
};