const { sendJsonResponse } = require("../utils/helpers");

/**
 * RBAC middleware factory.
 *
 * Usage:  router.get('/orders', authenticate, checkPermission('view_orders'), handler)
 *
 * Super-admin bypass: users whose role.title === 'Super Admin' pass all checks.
 */
function checkPermission(permissionName) {
	return function (req, res, next) {
		const user = req.user;

		if (!user) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Authentication required.");
		}

		// Super Admin bypasses all RBAC checks
		if (user.role?.title === "Super Admin") return next();

		if (!user.role || !Array.isArray(user.role.permissions)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.FORBIDDEN, false, "Access denied. No role assigned.");
		}

		if (!user.role.permissions.includes(permissionName)) {
			return sendJsonResponse(
				res,
				HTTP_STATUS_CODES.FORBIDDEN,
				false,
				`Access denied. Required permission: "${permissionName}".`
			);
		}

		next();
	};
}

function checkAnyPermission(...permissionNames) {
	const required = permissionNames.filter(Boolean);
	return function (req, res, next) {
		const user = req.user;

		if (!user) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Authentication required.");
		}

		if (user.role?.title === "Super Admin") return next();

		if (!user.role || !Array.isArray(user.role.permissions)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.FORBIDDEN, false, "Access denied. No role assigned.");
		}

		if (required.some((name) => user.role.permissions.includes(name))) {
			return next();
		}

		return sendJsonResponse(
			res,
			HTTP_STATUS_CODES.FORBIDDEN,
			false,
			`Access denied. Required one of: ${required.join(", ")}.`
		);
	};
}

module.exports = checkPermission;
module.exports.checkAnyPermission = checkAnyPermission;
