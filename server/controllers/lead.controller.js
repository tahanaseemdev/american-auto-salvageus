const { sendJsonResponse } = require("../utils/helpers");
const { createIncomingContactLead } = require("../services/incomingLead.service");

async function createIncomingLead(req, res, next) {
	try {
		const query = await createIncomingContactLead(req.body || {});

		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Contact lead received successfully.", {
			contactQueryId: query._id,
			name: query.name,
			subject: query.subject,
			assignedTo: query.assignedTo || null,
			assignmentStatus: query.assignmentStatus || null,
		});
	} catch (err) {
		if (err.statusCode) {
			return sendJsonResponse(res, err.statusCode, false, err.message);
		}
		next(err);
	}
}

module.exports = {
	createIncomingLead,
};
