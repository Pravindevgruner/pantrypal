const Product = require('../models/Product');
const Category = require('../models/Category');
const Inventory = require('../models/Inventory');
const { sendSuccess, sendError } = require('../utils/response');

const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, brand, sort, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { categoryName: new RegExp(search, 'i') },
        { SKU: new RegExp(search, 'i') },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    return sendSuccess(res, 'Products fetched successfully', {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return sendError(res, 'Product not found', {}, 404);
    }
    return sendSuccess(res, 'Product details fetched', { product });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, category, brand, image, price, discountPrice, stockQuantity, unit, weight, SKU, shelfLifeDays } = req.body;

    if (!name || !category || !price || !SKU) {
      return sendError(res, 'Please provide name, category, price, and SKU', {}, 400);
    }

    const catObj = await Category.findById(category);
    if (!catObj) return sendError(res, 'Invalid category ID', {}, 400);

    const existingSKU = await Product.findOne({ SKU: SKU.toUpperCase() });
    if (existingSKU) return sendError(res, 'Product with this SKU already exists', {}, 400);

    const product = await Product.create({
      name,
      description: description || '',
      category,
      categoryName: catObj.name,
      brand: brand || 'PantryPal Fresh',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      price,
      discountPrice: discountPrice || 0,
      stockQuantity: stockQuantity || 100,
      unit: unit || 'kg',
      weight: weight || '1 kg',
      SKU: SKU.toUpperCase(),
      shelfLifeDays: shelfLifeDays || 7,
      isAvailable: stockQuantity > 0,
    });

    // Create corresponding Inventory record
    await Inventory.create({
      product: product._id,
      SKU: product.SKU,
      currentQuantity: product.stockQuantity,
      unit: product.unit,
    });

    // Update category product count
    catObj.productCount += 1;
    await catObj.save();

    return sendSuccess(res, 'Product created successfully', { product }, 201);
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found', {}, 404);

    const fields = ['name', 'description', 'brand', 'image', 'price', 'discountPrice', 'stockQuantity', 'unit', 'weight', 'shelfLifeDays', 'isAvailable', 'isActive'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.body.category) {
      const catObj = await Category.findById(req.body.category);
      if (catObj) {
        product.category = req.body.category;
        product.categoryName = catObj.name;
      }
    }

    if (req.body.stockQuantity !== undefined) {
      product.isAvailable = req.body.stockQuantity > 0;
      await Inventory.findOneAndUpdate(
        { product: product._id },
        { currentQuantity: req.body.stockQuantity }
      );
    }

    await product.save();
    return sendSuccess(res, 'Product updated successfully', { product });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found', {}, 404);

    await Inventory.deleteOne({ product: product._id });
    await product.deleteOne();

    return sendSuccess(res, 'Product deleted successfully');
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
