const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const { sendJsonResponse } = require("../utils/helpers");
const { assignOrderRoundRobin } = require("../services/orderAssignment.service");
const { syncFulfillmentStatus, isValidAssignmentStatus } = require("../utils/orderStatusSync");
const {
	sendNewOrderLeadEmail,
	sendOrderCompletedAdminEmail,
	sendOrderRejectedAdminEmail,
} = require("../utils/mailer");

const STORE_WHATSAPP = process.env.STORE_WHATSAPP_NUMBER || "923001116556";

function buildOrderNumber() {
	const ts = Date.now().toString().slice(-8);
	const rand = Math.floor(1000 + Math.random() * 9000);
	return `AAS-${ts}${rand}`;
}

function sanitizeOrderProducts(products) {
	return (products || []).map((item) => {
		const productId = mongoose.isValidObjectId(item?.product) ? String(item.product) : undefined;
		return {
			...(productId ? { product: productId } : {}),
			name: String(item?.name || "").trim(),
			price: Number(item?.price) || 0,
			quantity: Math.max(1, Number(item?.quantity) || 1),
		};
	});
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

		const safeProducts = sanitizeOrderProducts(products).filter((item) => item.name);
		if (!safeProducts.length) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Order must contain at least one valid product.");
		}

		const totalAmount = Number(subtotal) + Number(shipping);

		const order = await Order.create({
			user: req.user?._id || null,
			orderNumber: buildOrderNumber(),
			products: safeProducts,
			subtotal: Number(subtotal),
			shipping: Number(shipping),
			totalAmount,
			shippingDetails,
			paymentMethod: paymentMethod || "card",
		});

		try {
			await sendNewOrderLeadEmail({ order, products: safeProducts });
		} catch (emailError) {
			console.error("Order lead email failed:", emailError?.message || emailError);
		}

		try {
			await assignOrderRoundRobin(order._id, safeProducts);
		} catch (assignError) {
			console.error("Order round-robin assignment failed:", assignError?.message || assignError);
		}

		// Clear the cart if user is logged in
		if (req.user) {
			await User.findByIdAndUpdate(req.user._id, { cart: [] });
		}

		// Build the WhatsApp message
		const itemLines = safeProducts
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

function userCanViewAllOrders(user) {
	if (user.role?.title === "Super Admin") return true;
	return user.role?.permissions?.includes("view_orders");
}

function userCanEditAllOrders(user) {
	if (user.role?.title === "Super Admin") return true;
	return user.role?.permissions?.includes("edit_orders");
}

async function adminGetAllOrders(req, res, next) {
	try {
		const { status, assignmentStatus, assignedTo, unassigned, page = 1, limit = 20 } = req.query;
		const filter = {};

		if (!userCanViewAllOrders(req.user)) {
			filter.assignedTo = req.user._id;
		} else {
			if (status) filter.status = status;
			if (assignmentStatus) filter.assignmentStatus = assignmentStatus;
			if (assignedTo) filter.assignedTo = assignedTo;
			if (unassigned === "true") filter.assignedTo = null;
		}

		const skip = (Number(page) - 1) * Number(limit);

		const [orders, total] = await Promise.all([
			Order.find(filter)
				.populate("user", "name email")
				.populate("assignedTo", "name email")
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

async function getMyAssignedOrders(req, res, next) {
	try {
		const { assignmentStatus, page = 1, limit = 50 } = req.query;
		const filter = { assignedTo: req.user._id };
		if (assignmentStatus) filter.assignmentStatus = assignmentStatus;

		const skip = (Number(page) - 1) * Number(limit);

		const [orders, total] = await Promise.all([
			Order.find(filter)
				.populate("assignedTo", "name email")
				.sort({ assignedAt: -1, createdAt: -1 })
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			Order.countDocuments(filter),
		]);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Assigned orders fetched.", {
			orders,
			pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
		});
	} catch (err) {
		next(err);
	}
}

async function updateAssignmentStatus(req, res, next) {
	try {
		const { assignmentStatus, employeeNotes } = req.body;
		if (!isValidAssignmentStatus(assignmentStatus)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid assignment status.");
		}

		const order = await Order.findById(req.params.id);
		if (!order) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Order not found.");

		const canEditAll = userCanEditAllOrders(req.user);
		const isAssignedEmployee =
			order.assignedTo && order.assignedTo.toString() === req.user._id.toString();

		if (!canEditAll && !isAssignedEmployee) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.FORBIDDEN, false, "Access denied.");
		}

		const previousStatus = order.assignmentStatus;
		order.assignmentStatus = assignmentStatus;
		if (employeeNotes !== undefined) order.employeeNotes = String(employeeNotes).trim();

		const newFulfillmentStatus = syncFulfillmentStatus(order.status, assignmentStatus);
		if (newFulfillmentStatus !== order.status) {
			order.status = newFulfillmentStatus;
		}

		order.assignmentHistory.push({
			from: order.assignedTo,
			to: order.assignedTo,
			by: req.user._id,
			action: `status_${assignmentStatus}`,
			note: employeeNotes || `Changed from ${previousStatus || "none"} to ${assignmentStatus}`,
			at: new Date(),
		});

		await order.save();
		await order.populate("assignedTo", "name email");
		await order.populate("user", "name email");

		const employee = order.assignedTo || req.user;
		try {
			if (assignmentStatus === "Completed") {
				await sendOrderCompletedAdminEmail({ order, employee });
			} else if (assignmentStatus === "Rejected" || assignmentStatus === "Cancelled") {
				await sendOrderRejectedAdminEmail({ order, employee, assignmentStatus });
			}
		} catch (emailError) {
			console.error("Assignment status email failed:", emailError?.message || emailError);
		}

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Assignment status updated.", order);
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

		const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
			.populate("user", "name email")
			.populate("assignedTo", "name email");
		if (!order) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Order not found.");

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Order status updated.", order);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	createOrder,
	getUserOrders,
	getOrderById,
	adminGetAllOrders,
	getMyAssignedOrders,
	updateOrderStatus,
	updateAssignmentStatus,
};
