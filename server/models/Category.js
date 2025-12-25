const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Category image is required']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Static method to get all active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

// Static method to update product count
categorySchema.statics.updateProductCount = async function(categoryName) {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ categories: categoryName });
  await this.updateOne({ name: categoryName }, { productCount: count });
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
