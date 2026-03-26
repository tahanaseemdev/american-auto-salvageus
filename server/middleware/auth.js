const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendJsonResponse } = require("../utils/helpers");

/**
 * Verifies the JWT from either:
 *  1. httpOnly cookie  `token`
 *  2. Authorization header  `Bearer <token>`
 *
 * Also enforces the isRevoked flag — if true the session is destroyed
 * immediately (the "Revoke" switch works in real-time on every request).
 */
async function authenticate(req, res, next) {
	try {
		let token = req.cookies?.token;

		if (!token) {
			const auth = req.headers.authorization;
			if (auth && auth.startsWith("Bearer ")) token = auth.slice(7);
		}

		if (!token) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Authentication required.");
		}

		let payload;
		try {
			payload = jwt.verify(token, process.env.JWT_SECRET);
		} catch {
			return sendJsonResponse(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Invalid or expired token.");
		}

		// Re-check the live DB record on every sensitive request
		const user = await User.findById(payload.id).populate("role").lean();
		if (!user) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, "User not found.");
		}

		if (user.isRevoked) {
			// Clear the cookie so the browser session is also destroyed
			res.clearCookie("token");
			return sendJsonResponse(res, HTTP_STATUS_CODES.FORBIDDEN, false, "Account has been revoked.");
		}

		req.user = user;
		next();
	} catch (err) {
		next(err);
	}
}

/**
 * Optional authentication — populates req.user if a valid token is present
 * but does NOT block the request if no token is provided.
 */
async function optionalAuth(req, _res, next) {
	try {
		let token = req.cookies?.token;
		if (!token) {
			const auth = req.headers.authorization;
			if (auth && auth.startsWith("Bearer ")) token = auth.slice(7);
		}
		if (token) {
			const payload = jwt.verify(token, process.env.JWT_SECRET);
			const user = await User.findById(payload.id).populate("role").lean();
			if (user && !user.isRevoked) req.user = user;
		}
	} catch {
		// Ignore token errors on optional routes
	}
	next();
}

module.exports = { authenticate, optionalAuth };
