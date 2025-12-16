const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Send token in HttpOnly cookie
const sendTokenResponse = (admin, statusCode, res) => {
  // Create token
  const token = generateToken({ 
    id: admin._id, 
    email: admin.email,
    role: admin.role 
  });

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    ...(process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN && {
      domain: process.env.COOKIE_DOMAIN
    })
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          fullName: admin.fullName,
          lastLogin: admin.lastLogin
        }
      }
    });
};

// Clear token cookie
const clearTokenResponse = (res) => {
  res
    .status(200)
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    })
    .json({
      success: true,
      message: 'Logged out successfully'
    });
};

module.exports = {
  generateToken,
  verifyToken,
  sendTokenResponse,
  clearTokenResponse
};