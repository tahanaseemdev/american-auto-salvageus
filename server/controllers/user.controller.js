const bcrypt = require("bcrypt");
const User = require("../models/User");
const Product = require("../models/Product");
const { sendJsonResponse } = require("../utils/helpers");

async function getProfile(req, res, next) {
	try {
		const user = await User.findById(req.user._id).populate("role").lean();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Profile fetched.", user);
	} catch (err) {
		next(err);
	}
}

async function updateProfile(req, res, next) {
	try {
		const { name, phone } = req.body;
		const updates = {};
		if (name) updates.name = name.trim();
		if (phone !== undefined) updates.phone = phone.trim();

		const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).lean();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Profile updated.", user);
	} catch (err) {
		next(err);
	}
}

async function changePassword(req, res, next) {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "currentPassword and newPassword are required.");
		}
		if (newPassword.length < 8) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "New password must be at least 8 characters.");
		}

		const user = await User.findById(req.user._id);
		if (!(await user.comparePassword(currentPassword))) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Current password is incorrect.");
		}

		user.password = newPassword;
		await user.save();

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Password changed successfully.");
	} catch (err) {
		next(err);
	}
}

// ── Cart ─────────────────────────────────────────────────────────────────────

async function getCart(req, res, next) {
	try {
		const user = await User.findById(req.user._id)
			.populate({ path: "cart.product", select: "name price image" })
			.lean();

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Cart fetched.", user.cart);
	} catch (err) {
		next(err);
	}
}

async function addToCart(req, res, next) {
	try {
		const { productId, quantity = 1 } = req.body;
		if (!productId) return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "productId is required.");

		const product = await Product.findById(productId);
		if (!product) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Product not found.");

		const user = await User.findById(req.user._id);
		const existing = user.cart.find((item) => item.product.toString() === productId);

		if (existing) {
			existing.quantity += Number(quantity);
		} else {
			user.cart.push({ product: productId, quantity: Number(quantity) });
		}

		await user.save();
		await user.populate({ path: "cart.product", select: "name price image" });
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Added to cart.", user.cart);
	} catch (err) {
		next(err);
	}
}

async function updateCartItem(req, res, next) {
	try {
		const { productId } = req.params;
		const { quantity } = req.body;

		if (quantity < 1) return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Quantity must be at least 1.");

		const user = await User.findById(req.user._id);
		const item = user.cart.find((i) => i.product.toString() === productId);
		if (!item) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Item not in cart.");

		item.quantity = Number(quantity);
		await user.save();
		await user.populate({ path: "cart.product", select: "name price image" });
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Cart updated.", user.cart);
	} catch (err) {
		next(err);
	}
}

async function removeFromCart(req, res, next) {
	try {
		const { productId } = req.params;
		const user = await User.findById(req.user._id);
		user.cart = user.cart.filter((i) => i.product.toString() !== productId);
		await user.save();
		await user.populate({ path: "cart.product", select: "name price image" });
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Item removed.", user.cart);
	} catch (err) {
		next(err);
	}
}

async function clearCart(req, res, next) {
	try {
		await User.findByIdAndUpdate(req.user._id, { cart: [] });
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Cart cleared.", []);
	} catch (err) {
		next(err);
	}
}

module.exports = { getProfile, updateProfile, changePassword, getCart, addToCart, updateCartItem, removeFromCart, clearCart };
