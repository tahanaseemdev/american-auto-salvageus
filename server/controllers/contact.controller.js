const ContactQuery = require("../models/ContactQuery");
const { sendJsonResponse } = require("../utils/helpers");

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
