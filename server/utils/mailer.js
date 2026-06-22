const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");

const DEFAULT_EMAIL_SENDER_NAME = "American Auto Salvage";
function getOrderLeadsEmail() {
	return process.env.ORDER_LEADS_EMAIL || process.env.CONTACT_LEADS_EMAIL || "";
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
		requireTLS: Number(port) === 587,
		auth: { user, pass },
	});
}

function isSmtpConfigured() {
	return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && (process.env.SMTP_PASS || process.env.SMTP_PASSWORD));
}

function getFromAddress() {
	const senderName = process.env.EMAIL_SENDER_NAME || process.env.SMTP_SENDER_NAME || DEFAULT_EMAIL_SENDER_NAME;
	const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_SENDER || process.env.SMTP_USER;
	return senderName ? `"${senderName}" <${senderEmail}>` : senderEmail;
}

function getAdminPanelUrl() {
	return process.env.ADMIN_PANEL_URL || process.env.ADMIN_URL || "http://localhost:5174";
}

function renderTemplate(templateName, variables) {
	const templatePath = path.join(__dirname, "emailTemplates", `${templateName}.html`);
	if (!fs.existsSync(templatePath)) {
		throw new Error(`Email template not found: ${templateName}`);
	}
	const source = fs.readFileSync(templatePath, "utf8");
	const template = handlebars.compile(source);
	return template({
		brandName: DEFAULT_EMAIL_SENDER_NAME,
		adminPanelUrl: getAdminPanelUrl(),
		year: new Date().getFullYear(),
		...variables,
	});
}

async function sendEmail({ to, subject, template, variables }) {
	if (!isSmtpConfigured()) {
		const message = "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env";
		console.warn(`Email skipped: ${subject} — ${message}`);
		return { sent: false, skipped: true, message };
	}

	const transport = createMailerTransport();
	try {
		const html = renderTemplate(template, variables);
		const mailOptions = {
			from: getFromAddress(),
			to,
			subject,
			html,
		};
		if (variables?.plainTextBody) {
			mailOptions.text = variables.plainTextBody;
		}
		const info = await transport.sendMail(mailOptions);
		console.info(`Email sent: "${subject}" → ${to} (${info.messageId || "ok"})`);
		return { sent: true, messageId: info.messageId };
	} catch (err) {
		const message = err?.message || "Failed to send email";
		console.error(`Email failed: "${subject}" → ${to}:`, message);
		return { sent: false, skipped: false, message };
	}
}

function formatOrderProducts(products) {
	return (products || []).map((item) => ({
		name: item.name || "Item",
		quantity: Number(item.quantity) || 1,
		lineTotal:
			Number(item.price) > 0
				? `$${(Number(item.price) * (Number(item.quantity) || 1)).toFixed(2)}`
				: "To be confirmed",
	}));
}

function formatShippingDetails(shipping = {}) {
	return {
		name: `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim() || "—",
		email: shipping.email || "—",
		phone: shipping.phone || "—",
		address: [shipping.address || shipping.street, shipping.city, shipping.state, shipping.zip]
			.filter(Boolean)
			.join(", ") || "—",
		notes: shipping.notes || "—",
	};
}

async function sendEmployeeWelcomeEmail({ employee, tempPassword }) {
	const loginUrl = `${getAdminPanelUrl()}/login`;
	const plainTextBody = [
		`Hi ${employee.name},`,
		"",
		"Your employee account has been created. Sign in with:",
		`Email: ${employee.email}`,
		`Temporary password: ${tempPassword}`,
		"",
		`Admin login: ${loginUrl}`,
		"",
		"You must change your password after first login.",
		"If you received a newer email, use only the latest password.",
	].join("\n");

	return sendEmail({
		to: employee.email,
		subject: "Your American Auto Salvage employee account",
		template: "employeeWelcome",
		variables: {
			employeeName: employee.name,
			email: employee.email,
			tempPassword,
			loginUrl,
			plainTextBody,
		},
	});
}

async function sendOrderAssignedEmployeeEmail({ order, employee, products, assignmentType = "assignment", adminNote = "" }) {
	const shipping = formatShippingDetails(order.shippingDetails);
	const noteBlock = adminNote
		? [`Admin note: ${adminNote}`, ""]
		: order.employeeNotes
			? [`Note: ${order.employeeNotes}`, ""]
			: [];

	const plainTextBody = [
		`Hi ${employee.name},`,
		"",
		`Order ${order.orderNumber} has been assigned to you (${assignmentType}).`,
		`Total: $${Number(order.totalAmount || 0).toFixed(2)}`,
		`Customer: ${shipping.name}`,
		`Phone: ${shipping.phone}`,
		`Email: ${shipping.email}`,
		...noteBlock,
		`View order: ${getAdminPanelUrl()}/my-orders`,
	].join("\n");

	return sendEmail({
		to: employee.email,
		subject: `Order ${order.orderNumber} assigned to you`,
		template: "orderAssignedEmployee",
		variables: {
			employeeName: employee.name,
			orderNumber: order.orderNumber,
			totalAmount: `$${Number(order.totalAmount || 0).toFixed(2)}`,
			customerName: shipping.name,
			customerPhone: shipping.phone,
			customerEmail: shipping.email,
			products: formatOrderProducts(products || order.products),
			ordersUrl: `${getAdminPanelUrl()}/my-orders`,
			assignmentType,
			adminNote: adminNote || order.employeeNotes || "",
			hasAdminNote: Boolean(adminNote || order.employeeNotes),
			plainTextBody,
		},
	});
}

async function sendOrderAssignedAdminEmail({ order, employee, assignmentType = "assignment", adminNote = "" }) {
	const to = getOrderLeadsEmail();
	if (!to) {
		console.warn("ORDER_LEADS_EMAIL not set — skipping admin assignment notification.");
		return { sent: false, skipped: true, message: "ORDER_LEADS_EMAIL not configured" };
	}
	return sendEmail({
		to,
		subject: `Order ${order.orderNumber} assigned to ${employee.name}`,
		template: "orderAssignedAdmin",
		variables: {
			orderNumber: order.orderNumber,
			employeeName: employee.name,
			employeeEmail: employee.email,
			totalAmount: `$${Number(order.totalAmount || 0).toFixed(2)}`,
			assignmentType,
			adminNote: adminNote || "",
			hasAdminNote: Boolean(adminNote),
		},
	});
}

async function sendOrderCompletedAdminEmail({ order, employee }) {
	const to = getOrderLeadsEmail();
	if (!to) {
		console.warn("ORDER_LEADS_EMAIL not set — skipping admin completion notification.");
		return { sent: false, skipped: true, message: "ORDER_LEADS_EMAIL not configured" };
	}
	return sendEmail({
		to,
		subject: `Order ${order.orderNumber} completed by ${employee.name}`,
		template: "orderCompletedAdmin",
		variables: {
			orderNumber: order.orderNumber,
			employeeName: employee.name,
			employeeEmail: employee.email,
			employeeNotes: order.employeeNotes || "—",
			totalAmount: `$${Number(order.totalAmount || 0).toFixed(2)}`,
		},
	});
}

async function sendOrderRejectedAdminEmail({ order, employee, assignmentStatus }) {
	const to = getOrderLeadsEmail();
	if (!to) {
		console.warn("ORDER_LEADS_EMAIL not set — skipping admin rejection notification.");
		return { sent: false, skipped: true, message: "ORDER_LEADS_EMAIL not configured" };
	}
	return sendEmail({
		to,
		subject: `Order ${order.orderNumber} marked ${assignmentStatus} by ${employee.name}`,
		template: "orderRejectedAdmin",
		variables: {
			orderNumber: order.orderNumber,
			employeeName: employee.name,
			employeeEmail: employee.email,
			assignmentStatus,
			employeeNotes: order.employeeNotes || "—",
		},
	});
}

async function sendContactLeadEmail(query) {
	const to = process.env.CONTACT_LEADS_EMAIL || process.env.ORDER_LEADS_EMAIL || "";
	if (!to) {
		console.warn("CONTACT_LEADS_EMAIL not set — skipping contact notification.");
		return { sent: false, skipped: true, message: "CONTACT_LEADS_EMAIL not configured" };
	}
	if (!isSmtpConfigured()) {
		const message = "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env";
		console.warn(`Email skipped: Contact query — ${message}`);
		return { sent: false, skipped: true, message };
	}

	const submittedAt = query?.createdAt ? new Date(query.createdAt).toLocaleString() : new Date().toLocaleString();
	const html = `
		<div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
			<h2 style="margin:0 0 12px;">New Contact Message Received</h2>
			<p style="margin:0 0 8px;"><strong>Name:</strong> ${query.name}</p>
			<p style="margin:0 0 8px;"><strong>Email:</strong> ${query.email}</p>
			<p style="margin:0 0 8px;"><strong>Phone:</strong> ${query.phone || "-"}</p>
			<p style="margin:0 0 8px;"><strong>Subject:</strong> ${query.subject}</p>
			<p style="margin:0 0 8px;"><strong>Submitted:</strong> ${submittedAt}</p>
			<hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0;" />
			<p style="margin:0;"><strong>Message:</strong></p>
			<p style="margin:8px 0 0;white-space:pre-wrap;">${query.message}</p>
		</div>
	`;

	const transport = createMailerTransport();
	const info = await transport.sendMail({
		from: getFromAddress(),
		to,
		subject: `New Contact Query: ${query.subject}`,
		html,
	});

	return { sent: true, messageId: info.messageId };
}

async function sendNewOrderLeadEmail({ order, products }) {
	const to = getOrderLeadsEmail();
	if (!to) {
		console.warn("ORDER_LEADS_EMAIL not set — skipping new order notification.");
		return { sent: false, skipped: true, message: "ORDER_LEADS_EMAIL not configured" };
	}
	if (!isSmtpConfigured()) {
		const message = "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env";
		console.warn(`Email skipped: New Order ${order.orderNumber} — ${message}`);
		return { sent: false, skipped: true, message };
	}

	const safeProducts = Array.isArray(products) ? products : order?.products || [];
	const itemRows = safeProducts
		.map((item) => {
			const qty = Number(item.quantity) || 1;
			const price = Number(item.price) || 0;
			const line = price > 0 ? `$${(price * qty).toFixed(2)}` : "To be confirmed";
			return `<tr>
				<td style="padding:8px;border:1px solid #e5e7eb;">${item.name}</td>
				<td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${qty}</td>
				<td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${line}</td>
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

	const transport = createMailerTransport();
	const info = await transport.sendMail({
		from: getFromAddress(),
		to,
		subject: `New Order ${order.orderNumber}`,
		html,
	});

	return { sent: true, messageId: info.messageId };
}

module.exports = {
	createMailerTransport,
	isSmtpConfigured,
	getFromAddress,
	getAdminPanelUrl,
	getOrderLeadsEmail,
	sendEmail,
	sendEmployeeWelcomeEmail,
	sendOrderAssignedEmployeeEmail,
	sendOrderAssignedAdminEmail,
	sendOrderCompletedAdminEmail,
	sendOrderRejectedAdminEmail,
	sendContactLeadEmail,
	sendNewOrderLeadEmail,
	formatOrderProducts,
	formatShippingDetails,
};
