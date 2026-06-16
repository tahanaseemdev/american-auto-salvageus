const { ASSIGNMENT_STATUSES } = require("../constants/permissions");

function syncFulfillmentStatus(currentStatus, assignmentStatus) {
	if (assignmentStatus === "InProgress" && currentStatus === "Pending") {
		return "Confirmed";
	}
	if (assignmentStatus === "Completed") {
		if (currentStatus === "Shipped") return "Delivered";
		return "Confirmed";
	}
	if (assignmentStatus === "Cancelled") {
		return "Cancelled";
	}
	return currentStatus;
}

function isValidAssignmentStatus(status) {
	return ASSIGNMENT_STATUSES.includes(status);
}

module.exports = { syncFulfillmentStatus, isValidAssignmentStatus };
