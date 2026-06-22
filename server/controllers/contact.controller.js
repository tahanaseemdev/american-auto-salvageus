const ContactQuery = require("../models/ContactQuery");
const { sendJsonResponse } = require("../utils/helpers");
const { sendContactLeadEmail, sendContactStatusAdminEmail } = require("../utils/mailer");
const { assignContactRoundRobin, reassignContact } = require("../services/contactAssignment.service");
const { ASSIGNMENT_STATUSES } = require("../constants/permissions");

function userCanViewAllContacts(user) {
	if (user.role?.title === "Super Admin") return true;
	return user.role?.permissions?.includes("view_contact_queries");
}

function userCanEditAllContacts(user) {
	if (user.role?.title === "Super Admin") return true;
	return user.role?.permissions?.includes("edit_orders");
}

function isValidAssignmentStatus(status) {
	return ASSIGNMENT_STATUSES.includes(status);
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
			source: "website",
		});

		try {
			await sendContactLeadEmail(query);
		} catch (mailErr) {
			console.error("Contact lead email failed:", mailErr?.message || mailErr);
		}

		try {
			await assignContactRoundRobin(query._id);
		} catch (assignErr) {
			console.error("Contact round-robin assignment failed:", assignErr?.message || assignErr);
		}

		const refreshed = await ContactQuery.findById(query._id).populate("assignedTo", "name email").lean();

		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Contact query submitted successfully.", refreshed || query);
	} catch (err) {
		next(err);
	}
}

async function adminGetContactQueries(req, res, next) {
	try {
		const { q, assignmentStatus, assignedTo, unassigned, page = 1, limit = 20 } = req.query;
		const filter = {};

		if (!userCanViewAllContacts(req.user)) {
			filter.assignedTo = req.user._id;
		} else {
			if (assignmentStatus) filter.assignmentStatus = assignmentStatus;
			if (assignedTo) filter.assignedTo = assignedTo;
			if (unassigned === "true") filter.assignedTo = null;
		}

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
				.populate("assignedTo", "name email")
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

async function getMyAssignedContactQueries(req, res, next) {
	try {
		const { assignmentStatus, page = 1, limit = 50 } = req.query;
		const filter = { assignedTo: req.user._id };
		if (assignmentStatus) filter.assignmentStatus = assignmentStatus;

		const skip = (Number(page) - 1) * Number(limit);

		const [queries, total] = await Promise.all([
			ContactQuery.find(filter)
				.populate("assignedTo", "name email")
				.sort({ assignedAt: -1, createdAt: -1 })
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			ContactQuery.countDocuments(filter),
		]);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Assigned leads fetched.", {
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
		)
			.populate("assignedTo", "name email")
			.lean();

		if (!query) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Contact query not found.");
		}

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Contact query marked as read.", query);
	} catch (err) {
		next(err);
	}
}

async function updateContactAssignmentStatus(req, res, next) {
	try {
		const { assignmentStatus, employeeNotes } = req.body;
		if (!isValidAssignmentStatus(assignmentStatus)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid assignment status.");
		}

		const query = await ContactQuery.findById(req.params.id);
		if (!query) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Contact query not found.");

		const canEditAll = userCanEditAllContacts(req.user);
		const isAssignedEmployee =
			query.assignedTo && query.assignedTo.toString() === req.user._id.toString();

		if (!canEditAll && !isAssignedEmployee) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.FORBIDDEN, false, "Access denied.");
		}

		const previousStatus = query.assignmentStatus;
		query.assignmentStatus = assignmentStatus;
		if (employeeNotes !== undefined) query.employeeNotes = String(employeeNotes).trim();

		if (assignmentStatus === "Completed") {
			query.isRead = true;
			query.readAt = new Date();
		}

		query.assignmentHistory.push({
			from: query.assignedTo,
			to: query.assignedTo,
			by: req.user._id,
			action: `status_${assignmentStatus}`,
			note: employeeNotes || `Changed from ${previousStatus || "none"} to ${assignmentStatus}`,
			at: new Date(),
		});

		await query.save();
		await query.populate("assignedTo", "name email");

		const employee = query.assignedTo || req.user;
		try {
			if (assignmentStatus === "Completed" || assignmentStatus === "Rejected" || assignmentStatus === "Cancelled") {
				await sendContactStatusAdminEmail({
					contact: query.toObject(),
					employee,
					assignmentStatus,
				});
			}
		} catch (emailError) {
			console.error("Contact status email failed:", emailError?.message || emailError);
		}

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Lead status updated.", query);
	} catch (err) {
		next(err);
	}
}

async function reassignContactToEmployee(req, res, next) {
	try {
		const { employeeId, note } = req.body;
		if (!employeeId) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "employeeId is required.");
		}

		const result = await reassignContact(req.params.id, employeeId, req.user._id, note, note);
		const populated = await ContactQuery.findById(result.contact._id)
			.populate("assignedTo", "name email")
			.lean();

		return sendJsonResponse(
			res,
			HTTP_STATUS_CODES.OK,
			true,
			populated?.assignedTo ? "Lead assigned. Employee and admin notified by email." : "Lead assigned.",
			populated
		);
	} catch (err) {
		if (err.message === "Invalid employee for reassignment.") {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, err.message);
		}
		if (err.message === "Contact query not found.") {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, err.message);
		}
		next(err);
	}
}

module.exports = {
	submitContactQuery,
	adminGetContactQueries,
	getMyAssignedContactQueries,
	markContactQueryRead,
	updateContactAssignmentStatus,
	reassignContactToEmployee,
};
