const { sendJsonResponse } = require("../utils/helpers");

function leadWebhookAuth(req, res, next) {
	const secret = String(process.env.LEADS_WEBHOOK_SECRET || "").trim();
	if (!secret) {
		if (process.env.ENVIRONMENT_STATUS === "production") {
			console.warn("LEADS_WEBHOOK_SECRET is not set — incoming leads endpoint is open.");
		}
		return next();
	}

	const apiKey = String(req.headers["x-api-key"] || "").trim();
	const bearer = String(req.headers.authorization || "");
	const bearerToken = bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : "";

	if (apiKey === secret || bearerToken === secret) {
		return next();
	}

	return sendJsonResponse(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Invalid or missing lead webhook credentials.");
}

module.exports = { leadWebhookAuth };
