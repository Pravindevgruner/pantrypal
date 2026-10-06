const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/response');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return sendSuccess(res, 'Categories fetched', { categories });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return sendError(res, 'Category already exists', {}, 400);
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    });

    return sendSuccess(res, 'Category created successfully', { category }, 201);
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 'Category not found', {}, 404);
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) category.description = description;
    if (image) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    return sendSuccess(res, 'Category updated', { category });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return sendError(res, 'Category not found', {}, 404);

    await category.deleteOne();
    return sendSuccess(res, 'Category deleted');
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
