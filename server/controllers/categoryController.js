const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { active } = req.query;
  
  const query = active === 'true' ? { isActive: true } : {};
  
  const categories = await Category.find(query).sort({ order: 1, name: 1 });
  
  res.json({
    success: true,
    data: {
      categories,
      total: categories.length
    }
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.json({
    success: true,
    data: { category }
  });
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, image, description, order } = req.body;
  
  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    res.status(400);
    throw new Error('Category already exists');
  }
  
  const category = await Category.create({
    name,
    image,
    description,
    order: order || 0
  });
  
  res.status(201).json({
    success: true,
    data: { category },
    message: 'Category created successfully'
  });
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const { name, image, description, isActive, order } = req.body;
  
  // Check if new name conflicts with existing category
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400);
      throw new Error('Category name already exists');
    }
  }
  
  category.name = name || category.name;
  category.image = image || category.image;
  category.description = description !== undefined ? description : category.description;
  category.isActive = isActive !== undefined ? isActive : category.isActive;
  category.order = order !== undefined ? order : category.order;
  
  await category.save();
  
  res.json({
    success: true,
    data: { category },
    message: 'Category updated successfully'
  });
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  await category.deleteOne();
  
  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Update product counts for all categories
// @route   POST /api/admin/categories/update-counts
// @access  Private/Admin
const updateProductCounts = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  
  for (const category of categories) {
    await Category.updateProductCount(category.name);
  }
  
  res.json({
    success: true,
    message: 'Product counts updated successfully'
  });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProductCounts
};
