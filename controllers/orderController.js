const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

// GET /api/orders - Get all orders with populated data
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("customer_id", "name email phone address")
      .populate("items.product_id", "name price category");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id - Get single order
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer_id", "name email phone address")
      .populate("items.product_id", "name price category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders - Create new order
const createOrder = async (req, res, next) => {
  try {
    const { customer_id, items, payment_method, status, order_date } = req.body;

    // Validate required fields
    if (!customer_id || !items || !payment_method || !status) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: customer_id, items, payment_method, status",
      });
    }

    // Validate customer exists
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must have at least one item",
      });
    }

    // Process each item
    const processedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const { product_id, quantity } = item;

      // Validate quantity
      if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({
          success: false,
          message: "Each item quantity must be an integer >= 1",
        });
      }

      // Validate product exists
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${product_id}`,
        });
      }

      // Check stock availability
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${quantity}`,
        });
      }

      // Calculate price_at_order and total from server
      const priceAtOrder = product.price;
      const itemTotal = priceAtOrder * quantity;

      processedItems.push({
        product_id,
        quantity,
        price_at_order: priceAtOrder,
        total: itemTotal,
      });

      totalAmount += itemTotal;
    }

    // Create order
    const orderData = {
      customer_id,
      items: processedItems,
      total_amount: totalAmount,
      payment_method,
      status,
      order_date: order_date || new Date(),
    };

    const order = await Order.create(orderData);

    // Update product stock
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Populate the created order
    const populatedOrder = await Order.findById(order._id)
      .populate("customer_id", "name email phone address")
      .populate("items.product_id", "name price category");

    res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id - Update order
const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("customer_id", "name email phone address")
      .populate("items.product_id", "name price category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/orders/:id - Delete order
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
