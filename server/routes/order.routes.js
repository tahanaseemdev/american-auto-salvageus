const router = require("express").Router();
const { createOrder, getUserOrders, getOrderById } = require("../controllers/order.controller");
const { authenticate, optionalAuth } = require("../middleware/auth");

// Guest checkout supported via optionalAuth
router.post("/", optionalAuth, createOrder);

// Authenticated user order history
router.get("/my-orders", authenticate, getUserOrders);
router.get("/:id", authenticate, getOrderById);

module.exports = router;
