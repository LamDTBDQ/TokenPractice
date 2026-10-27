const Product = require("../models/Product");
const Order = require("../models/Order");

// GET /api/products - Get all products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id - Get single product
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products - Create new product
const createProduct = async (req, res, next) => {
  try {
    const { name, price, category, stock } = req.body;

    // Validate required fields
    if (!name || price === undefined || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, price, category, stock",
      });
    }

    const product = await Product.create({
      name,
      price,
      category,
      stock,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id - Update product
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id - Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    // Check if any order references this product
    const orderWithProduct = await Order.findOne({
      "items.product_id": productId,
    });

    if (orderWithProduct) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete product. It is referenced by one or more orders.",
      });
    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
