const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false // Don't include password in queries by default
  },
  
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  },
  
  // Security fields
  lastLogin: {
    type: Date
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockedUntil: {
    type: Date
  },
  
  // Profile fields
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.email;
});

// Virtual for account lockout status
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
});

// Indexes (email index is automatically created by unique: true constraint)
adminSchema.index({ role: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.passwordHash) {
    console.log('❌ Missing password or hash');
    return false;
  }
  
  try {
    console.log('🔑 Comparing password length:', candidatePassword.length);
    console.log('🔑 Hash length:', this.passwordHash.length);
    const result = await bcrypt.compare(candidatePassword, this.passwordHash);
    console.log('🔑 Bcrypt compare result:', result);
    return result;
  } catch (error) {
    console.log('❌ Bcrypt compare error:', error.message);
    return false;
  }
};

// Instance method to increment login attempts
adminSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockedUntil && this.lockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockedUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockedUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockedUntil: 1 },
    $set: { lastLogin: Date.now(), lastActivity: Date.now() }
  });
};

// Instance method to update last activity
adminSchema.methods.updateLastActivity = function() {
  this.lastActivity = Date.now();
  return this.save();
};

// Static method to find by email
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

// Static method to find by email with password (for authentication)
adminSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true }).select('+passwordHash');
};

// Static method to create admin (for initial setup)
adminSchema.statics.createAdmin = async function(adminData) {
  const { email, password, firstName, lastName } = adminData;
  
  // Check if admin already exists
  const existingAdmin = await this.findByEmail(email);
  if (existingAdmin) {
    throw new Error('Admin already exists');
  }
  
  // Create new admin
  const admin = new this({
    email: email.toLowerCase(),
    passwordHash: password, // Will be hashed by pre-save middleware
    firstName,
    lastName
  });
  
  await admin.save();
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);