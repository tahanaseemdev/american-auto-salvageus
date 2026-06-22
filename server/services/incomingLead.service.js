const ContactQuery = require("../models/ContactQuery");
const { sendContactLeadEmail } = require("../utils/mailer");
const { assignContactRoundRobin } = require("../services/contactAssignment.service");

function parseLeadName({ name, firstName, lastName, fullName }) {
	const direct = String(name || "").trim();
	if (direct) return direct;

	if (String(firstName || "").trim()) {
		return [firstName, lastName].map((part) => String(part || "").trim()).filter(Boolean).join(" ");
	}

	return String(fullName || "").trim();
}

function buildLeadMessage({ message, notes, carDetails, year, make, model, part, source }) {
	const direct = String(message || "").trim();
	if (direct) return direct;

	const lines = [];
	const leadSource = String(source || "facebook_lead").trim();
	if (leadSource) lines.push(`Lead source: ${leadSource}`);

	const carLabel = String(carDetails || "").trim();
	if (carLabel) {
		lines.push(`Car details: ${carLabel}`);
	} else {
		const vehicleBits = [year, make, model, part]
			.map((value) => String(value || "").trim())
			.filter(Boolean);
		if (vehicleBits.length) {
			lines.push(`Vehicle: ${vehicleBits.join(" | ")}`);
		}
	}

	const customNotes = String(notes || "").trim();
	if (customNotes) lines.push(customNotes);

	return lines.join("\n").trim() || "Facebook lead submitted via Make.com.";
}

function resolveLeadEmail({ email, phone }) {
	const normalizedEmail = String(email || "").trim().toLowerCase();
	if (normalizedEmail) return normalizedEmail;

	const digits = String(phone || "").replace(/\D/g, "");
	if (digits) return `lead+${digits}@incoming.americanautosalvageus.com`;

	return "";
}

function normalizeIncomingLeadPayload(payload = {}) {
	const phone = String(payload.phone || payload.phone_number || "").trim();
	const email = resolveLeadEmail({ email: payload.email, phone });
	const name = parseLeadName(payload);
	const subject = String(payload.subject || "").trim() || "Facebook Lead Ad";
	const message = buildLeadMessage(payload);

	return {
		name,
		email,
		phone,
		subject,
		message,
	};
}

async function createIncomingContactLead(payload) {
	const normalized = normalizeIncomingLeadPayload(payload);

	if (!normalized.name) {
		const error = new Error("name is required.");
		error.statusCode = HTTP_STATUS_CODES.BAD_REQUEST;
		throw error;
	}

	if (!normalized.email) {
		const error = new Error("email or phone is required.");
		error.statusCode = HTTP_STATUS_CODES.BAD_REQUEST;
		throw error;
	}

	if (!normalized.message) {
		const error = new Error("message is required.");
		error.statusCode = HTTP_STATUS_CODES.BAD_REQUEST;
		throw error;
	}

	const query = await ContactQuery.create({
		name: normalized.name,
		email: normalized.email,
		phone: normalized.phone,
		subject: normalized.subject,
		message: normalized.message,
		source: String(payload.source || "facebook_lead").trim() || "facebook_lead",
	});

	try {
		await sendContactLeadEmail(query);
	} catch (mailErr) {
		console.error("Incoming contact lead email failed:", mailErr?.message || mailErr);
	}

	try {
		const assignment = await assignContactRoundRobin(query._id);
		if (assignment?.contact) return assignment.contact;
	} catch (assignErr) {
		console.error("Incoming contact assignment failed:", assignErr?.message || assignErr);
	}

	return ContactQuery.findById(query._id).populate("assignedTo", "name email").lean();
}

module.exports = {
	createIncomingContactLead,
	normalizeIncomingLeadPayload,
	parseLeadName,
	buildLeadMessage,
};
