/**
 * Sends a standardised JSON API response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {boolean} success
 * @param {string} message
 * @param {*} [data]
 */
function sendJsonResponse(res, statusCode, success, message, data = null) {
	const body = { success, message };
	if (data !== null && data !== undefined) body.data = data;
	return res.status(statusCode).json(body);
}

module.exports = { sendJsonResponse };
