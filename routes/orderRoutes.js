const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

// All routes are protected
router.use(protect);

router.route("/").get(getAllOrders).post(createOrder);

router.route("/:id").get(getOrderById).put(updateOrder).delete(deleteOrder);

module.exports = router;
