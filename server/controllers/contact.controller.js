const ContactQuery = require("../models/ContactQuery");
const { sendJsonResponse } = require("../utils/helpers");
const nodemailer = require("nodemailer");

const CONTACT_LEADS_EMAIL = process.env.CONTACT_LEADS_EMAIL || process.env.ORDER_LEADS_EMAIL || "Americansalvageleadsus@gmail.com";
const DEFAULT_EMAIL_SENDER_NAME = "American Auto Salvage";

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

async function sendContactLeadEmail(query) {
	const transport = createMailerTransport();
	if (!transport) return false;

	const senderName = process.env.EMAIL_SENDER_NAME || process.env.SMTP_SENDER_NAME || DEFAULT_EMAIL_SENDER_NAME;
	const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_SENDER || process.env.SMTP_USER;
	const from = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail;

	const submittedAt = query?.createdAt ? new Date(query.createdAt).toLocaleString() : new Date().toLocaleString();

	await transport.sendMail({
		from,
		to: CONTACT_LEADS_EMAIL,
		subject: `New Contact Query: ${query.subject}`,
		html: `
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
		`,
	});

	return true;
}

async function submitContactQuery(req, res, next) {
	try {
		const { name, email, phone = "", subject, message } = req.body;

		if (!name || !email || !subject || !message) {
			return sendJsonResponse(
				res,
				HTTP_STATUS_CODES.BAD_REQUEST,
				false,
				"name, email, subject, and message are required."
			);
		}

		const query = await ContactQuery.create({
			name: String(name).trim(),
			email: String(email).trim().toLowerCase(),
			phone: String(phone || "").trim(),
			subject: String(subject).trim(),
			message: String(message).trim(),
		});

		try {
			await sendContactLeadEmail(query);
		} catch (mailErr) {
			console.error("Contact lead email failed:", mailErr?.message || mailErr);
		}

		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Contact query submitted successfully.", query);
	} catch (err) {
		next(err);
	}
}

async function adminGetContactQueries(req, res, next) {
	try {
		const { q, page = 1, limit = 20 } = req.query;
		const filter = {};
		if (q) {
			filter.$or = [
				{ name: { $regex: q, $options: "i" } },
				{ email: { $regex: q, $options: "i" } },
				{ subject: { $regex: q, $options: "i" } },
				{ message: { $regex: q, $options: "i" } },
			];
		}

		const skip = (Number(page) - 1) * Number(limit);
		const [queries, total] = await Promise.all([
			ContactQuery.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			ContactQuery.countDocuments(filter),
		]);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Contact queries fetched.", {
			queries,
			pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
		});
	} catch (err) {
		next(err);
	}
}

async function markContactQueryRead(req, res, next) {
	try {
		const query = await ContactQuery.findByIdAndUpdate(
			req.params.id,
			{ isRead: true, readAt: new Date() },
			{ new: true }
		).lean();

		if (!query) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Contact query not found.");
		}

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Contact query marked as read.", query);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	submitContactQuery,
	adminGetContactQueries,
	markContactQueryRead,
};
