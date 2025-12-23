const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  images: [{
    type: String,
    validate: {
      validator: function(url) {
        // Accept most http/https URLs (some CDNs omit file extensions)
        const urlPattern = /^https?:\/\/.+/i;
        return urlPattern.test(url);
      },
      message: 'Invalid image URL format'
    }
  }],
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    // Accept numeric prices; frontend should convert to two decimals when displaying
  },
  
  // Legacy fields (kept for backwards compatibility)
  affiliateUrl: {
    type: String,
    validate: {
      validator: function(url) {
        if (!url) return true; // Optional for backwards compatibility
        const urlPattern = /^https?:\/\/.+/i;
        const isValidUrl = urlPattern.test(url);
        const hasJavaScript = /javascript:/i.test(url);
        return isValidUrl && !hasJavaScript;
      },
      message: 'Invalid affiliate URL format or contains unsafe schemes'
    }
  },
  
  // New multiple affiliate links structure
  affiliateLinks: [{
    url: {
      type: String,
      required: [true, 'Affiliate URL is required'],
      validate: {
        validator: function(url) {
          const urlPattern = /^https?:\/\/.+/i;
          const isValidUrl = urlPattern.test(url);
          const hasJavaScript = /javascript:/i.test(url);
          return isValidUrl && !hasJavaScript;
        },
        message: 'Invalid affiliate URL format or contains unsafe schemes'
      }
    },
    network: {
      type: String,
      required: [true, 'Affiliate network is required'],
      trim: true,
      maxlength: [100, 'Network name cannot exceed 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required for this affiliate link'],
      min: [0, 'Price cannot be negative']
    },
    label: {
      type: String,
      trim: true,
      maxlength: [50, 'Link label cannot exceed 50 characters'],
      default: function() {
        return `Buy on ${this.network}`;
      }
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  categories: [{
    type: String,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  }],
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  topSelling: {
    type: Boolean,
    default: false,
    index: true
  },
  
  clicks: {
    type: Number,
    default: 0,
    min: [0, 'Clicks cannot be negative']
  },
  
  conversions: {
    type: Number,
    default: 0,
    min: [0, 'Conversions cannot be negative']
  },
  
  // Computed field for CTR (Click Through Rate)
  ctr: {
    type: Number,
    default: 0
  },
  
  // SEO fields
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  
  // Status field for admin control
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ title: 'text', shortDescription: 'text', description: 'text' });
productSchema.index({ categories: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ topSelling: 1, createdAt: -1 });
productSchema.index({ status: 1, createdAt: -1 });

// Compound indexes for common queries
productSchema.index({ status: 1, topSelling: 1, createdAt: -1 });
productSchema.index({ status: 1, clicks: -1 });
productSchema.index({ status: 1, conversions: -1 });
productSchema.index({ categories: 1, status: 1 });
productSchema.index({ slug: 1, status: 1 });

// Virtual for conversion rate
productSchema.virtual('conversionRate').get(function() {
  return this.clicks > 0 ? ((this.conversions / this.clicks) * 100).toFixed(2) : 0;
});

// Virtual for revenue estimate (placeholder - would need actual commission rates)
productSchema.virtual('estimatedRevenue').get(function() {
  // Assuming 5% commission rate as default
  const commissionRate = 0.05;
  return (this.conversions * this.price * commissionRate).toFixed(2);
});

// Pre-save middleware for data migration and validation
productSchema.pre('save', async function(next) {
  // Handle migration from legacy affiliateUrl to affiliateLinks
  if (this.affiliateUrl && (!this.affiliateLinks || this.affiliateLinks.length === 0)) {
    this.affiliateLinks = [{
      url: this.affiliateUrl,
      network: 'Unknown',
      price: this.price || 0,
      label: 'Buy Now',
      isPrimary: true
    }];
  }
  
  // Ensure at least one affiliate link exists
  if (!this.affiliateLinks || this.affiliateLinks.length === 0) {
    return next(new Error('At least one affiliate link is required'));
  }
  
  // Calculate main price as minimum of all affiliate link prices
  if (this.affiliateLinks && this.affiliateLinks.length > 0) {
    const prices = this.affiliateLinks
      .filter(link => link.price != null && link.price >= 0)
      .map(link => link.price);
    
    if (prices.length > 0) {
      this.price = Math.min(...prices);
    }
  }
  
  // Ensure only one primary link
  const primaryLinks = this.affiliateLinks.filter(link => link.isPrimary);
  if (primaryLinks.length === 0) {
    // Set first link as primary if none specified
    this.affiliateLinks[0].isPrimary = true;
  } else if (primaryLinks.length > 1) {
    // Keep only the first primary link
    this.affiliateLinks.forEach((link, index) => {
      link.isPrimary = index === this.affiliateLinks.findIndex(l => l.isPrimary);
    });
  }
  
  // Generate slug
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Ensure slug uniqueness
    if (this.isNew) {
      try {
        const existingDoc = await this.constructor.findOne({ slug: this.slug });
        if (existingDoc) {
          this.slug = `${this.slug}-${Date.now()}`;
        }
      } catch (error) {
        return next(error);
      }
    }
  }
  
  // Update CTR
  if (this.clicks > 0) {
    this.ctr = ((this.conversions / this.clicks) * 100);
  }
  
  next();
});

// Static method to find top selling products
productSchema.statics.findTopSelling = function(limit = 8) {
  return this.find({ topSelling: true, status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v')
    .lean(); // Safe: just returning data to client, no virtuals needed
};

// Static method to find latest products
productSchema.statics.findLatest = function(limit = 12) {
  return this.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v')
    .lean(); // Safe: just returning data to client, no virtuals needed
};

// Static method for search with pagination
productSchema.statics.searchProducts = function(query, options = {}) {
  const {
    page = 1,
    limit = 12,
    categories = [],
    tags = [],
    sortBy = 'createdAt',
    sortOrder = -1,
    topSelling = null
  } = options;
  
  const skip = (page - 1) * limit;
  const searchQuery = { status: 'active' };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Category filter
  if (categories.length > 0) {
    searchQuery.categories = { $in: categories };
  }
  
  // Tags filter
  if (tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }
  
  // Top Selling filter
  if (topSelling !== null) {
    searchQuery.topSelling = topSelling;
  }
  
  const sort = {};
  sort[sortBy] = sortOrder;
  
  return this.find(searchQuery)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Method to increment clicks
productSchema.methods.incrementClicks = function() {
  this.clicks += 1;
  return this.save();
};

// Method to increment conversions
productSchema.methods.incrementConversions = function() {
  this.conversions += 1;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);