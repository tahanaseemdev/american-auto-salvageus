const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const {
	getProfile,
	updateProfile,
	changePassword,
	getCart,
	addToCart,
	updateCartItem,
	removeFromCart,
	clearCart,
} = require("../controllers/user.controller");

// All user routes require authentication
router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart/:productId", updateCartItem);
router.delete("/cart/:productId", removeFromCart);
router.delete("/cart", clearCart);

module.exports = router;
