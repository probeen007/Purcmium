const express = require('express');
const Admin = require('../models/Admin');
const { sendTokenResponse, clearTokenResponse } = require('../utils/jwt');
const { protect } = require('../middleware/auth');
const { validate, loginSchema } = require('../middleware/validation');

const router = express.Router();

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    // Find admin with password field
    const admin = await Admin.findByEmailWithPassword(email);

    if (!admin) {
      console.log('❌ Admin not found:', email);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    console.log('✅ Admin found:', email);

    // Check if account is locked
    if (admin.isLocked) {
      console.log('🔒 Account locked:', email);
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked due to failed login attempts. Please try again later.'
        }
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      console.log('❌ Account inactive:', email);
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account has been deactivated'
        }
      });
    }

    // Check password
    console.log('🔑 Checking password...');
    const isMatch = await admin.comparePassword(password);
    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      // Increment login attempts
      await admin.incrementLoginAttempts();

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    console.log('✅ Login successful:', email);

    // Send token response
    sendTokenResponse(admin, 200, res);

  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
});

// @desc    Logout admin
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res, next) => {
  try {
    clearTokenResponse(res);
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          fullName: admin.fullName,
          firstName: admin.firstName,
          lastName: admin.lastName,
          lastLogin: admin.lastLogin,
          lastActivity: admin.lastActivity,
          createdAt: admin.createdAt
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Check authentication status
// @route   GET /api/auth/check
// @access  Public (but checks for auth)
router.get('/check', async (req, res, next) => {
  try {
    let token;

    // Get token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // No token
    if (!token || token === 'none') {
      return res.status(200).json({
        success: true,
        data: {
          isAuthenticated: false,
          admin: null
        }
      });
    }

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get admin from database
      const admin = await Admin.findById(decoded.id);
      
      if (!admin || !admin.isActive || admin.isLocked) {
        return res.status(200).json({
          success: true,
          data: {
            isAuthenticated: false,
            admin: null
          }
        });
      }

      // Update last activity
      admin.updateLastActivity();

      res.status(200).json({
        success: true,
        data: {
          isAuthenticated: true,
          admin: {
            id: admin._id,
            email: admin.email,
            role: admin.role,
            fullName: admin.fullName
          }
        }
      });

    } catch (error) {
      // Invalid token
      res.status(200).json({
        success: true,
        data: {
          isAuthenticated: false,
          admin: null
        }
      });
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;