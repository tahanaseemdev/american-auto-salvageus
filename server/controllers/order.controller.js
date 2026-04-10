const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Order = require("../models/Order");
const User = require("../models/User");
const { sendJsonResponse } = require("../utils/helpers");

const STORE_WHATSAPP = process.env.STORE_WHATSAPP_NUMBER || "923001116556";
const ORDER_LEADS_EMAIL = process.env.ORDER_LEADS_EMAIL || "americansalvageleads@gmail.com";

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

function createMailerTransport() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 587);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

	if (!host || !user || !pass) return null;

	return nodemailer.createTransport({
		host,
		port,
		secure: Number(port) === 465,
		auth: { user, pass },
	});
}

async function sendOrderLeadEmail({ order, safeProducts }) {
	const transport = createMailerTransport();
	if (!transport) return false;

	const senderName = process.env.EMAIL_SENDER_NAME || process.env.SMTP_SENDER_NAME;
	const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_SENDER || process.env.SMTP_USER;
	const from = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail;

	const itemRows = safeProducts
		.map((item) => {
			const qty = Number(item.quantity) || 1;
			const price = Number(item.price) || 0;
			const line = price > 0 ? `$${(price * qty).toFixed(2)}` : "To be confirmed";
			return `<tr>
				<td style=\"padding:8px;border:1px solid #e5e7eb;\">${item.name}</td>
				<td style=\"padding:8px;border:1px solid #e5e7eb;text-align:center;\">${qty}</td>
				<td style=\"padding:8px;border:1px solid #e5e7eb;text-align:right;\">${line}</td>
			</tr>`;
		})
		.join("");

	const shipping = order.shippingDetails || {};
	const html = `
		<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
			<h2 style="margin:0 0 12px;">New Order Received</h2>
			<p style="margin:0 0 8px;"><strong>Order #:</strong> ${order.orderNumber}</p>
			<p style="margin:0 0 8px;"><strong>Payment Method:</strong> ${order.paymentMethod || "N/A"}</p>
			<p style="margin:0 0 16px;"><strong>Total:</strong> $${Number(order.totalAmount || 0).toFixed(2)}</p>

			<h3 style="margin:0 0 8px;">Products</h3>
			<table style="border-collapse:collapse;width:100%;margin-bottom:16px;">
				<thead>
					<tr>
						<th style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;text-align:left;">Item</th>
						<th style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;text-align:center;">Qty</th>
						<th style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;text-align:right;">Line Total</th>
					</tr>
				</thead>
				<tbody>${itemRows}</tbody>
			</table>

			<h3 style="margin:0 0 8px;">Customer Details</h3>
			<p style="margin:0;">${shipping.firstName || ""} ${shipping.lastName || ""}</p>
			<p style="margin:0;">Email: ${shipping.email || "-"}</p>
			<p style="margin:0;">Phone: ${shipping.phone || "-"}</p>
			<p style="margin:0;">Address: ${shipping.address || shipping.street || "-"}, ${shipping.city || ""}, ${shipping.state || ""} ${shipping.zip || ""}</p>
			<p style="margin:8px 0 0;"><strong>Notes:</strong> ${shipping.notes || "-"}</p>
		</div>
	`;

	await transport.sendMail({
		from,
		to: ORDER_LEADS_EMAIL,
		subject: `New Order ${order.orderNumber}`,
		html,
	});

	return true;
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
			await sendOrderLeadEmail({ order, safeProducts });
		} catch (emailError) {
			console.error("Order lead email failed:", emailError?.message || emailError);
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
