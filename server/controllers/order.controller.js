const Order = require("../models/Order");
const User = require("../models/User");
const { sendJsonResponse } = require("../utils/helpers");

const STORE_WHATSAPP = process.env.STORE_WHATSAPP_NUMBER || "923001116556";

function buildOrderNumber() {
	const ts = Date.now().toString().slice(-8);
	const rand = Math.floor(1000 + Math.random() * 9000);
	return `AAS-${ts}${rand}`;
}

async function createOrder(req, res, next) {
	try {
		const { products, shippingDetails, paymentMethod, subtotal, shipping = 0 } = req.body;

		if (!products || !products.length) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Order must contain at least one product.");
		}
		if (!shippingDetails) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Shipping details are required.");
		}

		const totalAmount = Number(subtotal) + Number(shipping);

		const order = await Order.create({
			user: req.user?._id || null,
			orderNumber: buildOrderNumber(),
			products,
			subtotal: Number(subtotal),
			shipping: Number(shipping),
			totalAmount,
			shippingDetails,
			paymentMethod: paymentMethod || "card",
		});

		// Clear the cart if user is logged in
		if (req.user) {
			await User.findByIdAndUpdate(req.user._id, { cart: [] });
		}

		// Build the WhatsApp message
		const itemLines = products
			.map((p) => {
				const quantity = Number(p.quantity) || 1;
				const lineTotal = (Number(p.price) || 0) * quantity;
				if (lineTotal > 0) {
					return `• ${p.name} (x${quantity}) — $${lineTotal.toFixed(2)}`;
				}
				return `• ${p.name} (x${quantity})`;
			})
			.join("\n");

		const totalLine = totalAmount > 0 ? `Total: $${totalAmount.toFixed(2)}` : "Total: To be confirmed";

		const waMessage = encodeURIComponent(
			`Hi! I just placed an order on American Auto Salvage US.\n\n` +
			`Order #: ${order.orderNumber}\n` +
			`Items:\n${itemLines}\n\n` +
			`${totalLine}\n\n` +
			`Ship to: ${shippingDetails.firstName} ${shippingDetails.lastName}, ` +
			`${shippingDetails.address || shippingDetails.street || ""}, ${shippingDetails.city || ""}, ${shippingDetails.state || ""} ${shippingDetails.zip || ""}\n\n` +
			`Please confirm my order. Thank you!`
		);

		const whatsappUrl = `https://wa.me/${STORE_WHATSAPP}?text=${waMessage}`;

		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Order placed successfully.", {
			orderId: order._id,
			orderNumber: order.orderNumber,
			whatsappUrl,
		});
	} catch (err) {
		next(err);
	}
}

async function getUserOrders(req, res, next) {
	try {
		const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Orders fetched.", orders);
	} catch (err) {
		next(err);
	}
}

async function getOrderById(req, res, next) {
	try {
		const order = await Order.findById(req.params.id).lean();
		if (!order) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Order not found.");

		// Non-admin users can only view their own orders
		if (req.user && order.user && order.user.toString() !== req.user._id.toString() && !req.user.role) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.FORBIDDEN, false, "Access denied.");
		}

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Order fetched.", order);
	} catch (err) {
		next(err);
	}
}

// ── Admin ─────────────────────────────────────────────────────────────────────

async function adminGetAllOrders(req, res, next) {
	try {
		const { status, page = 1, limit = 20 } = req.query;
		const filter = status ? { status } : {};
		const skip = (Number(page) - 1) * Number(limit);

		const [orders, total] = await Promise.all([
			Order.find(filter)
				.populate("user", "name email")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			Order.countDocuments(filter),
		]);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Orders fetched.", {
			orders,
			pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
		});
	} catch (err) {
		next(err);
	}
}

async function updateOrderStatus(req, res, next) {
	try {
		const { status } = req.body;
		const validStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
		if (!validStatuses.includes(status)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
		}

		const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate("user", "name email");
		if (!order) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Order not found.");

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Order status updated.", order);
	} catch (err) {
		next(err);
	}
}

module.exports = { createOrder, getUserOrders, getOrderById, adminGetAllOrders, updateOrderStatus };
