const User = require("../models/User");
const AppSettings = require("../models/AppSettings");
const { ensureEmployeeSetup } = require("../utils/ensureEmployeeSetup");

// Single shared rotation for BOTH orders and contact queries. Using one key
// means the two work types advance the same counter, so with two employees an
// order goes to the first and the next contact query goes to the second,
// instead of each type rotating independently and doubling up on one person.
const ASSIGNMENT_SETTINGS_KEY = "employee_assignment";

async function getActiveEmployees() {
	const employeeRole = await ensureEmployeeSetup();
	if (!employeeRole) return [];

	return User.find({
		role: employeeRole._id,
		isRevoked: false,
		isActiveForAssignment: true,
	})
		.sort({ employeeQueueOrder: 1, createdAt: 1 })
		.select("name email")
		.lean();
}

async function pickNextEmployee(employees) {
	if (!employees.length) return null;

	const settings = await AppSettings.findOneAndUpdate(
		{ key: ASSIGNMENT_SETTINGS_KEY },
		{ $inc: { assignmentCounter: 1 }, $setOnInsert: { lastAssignedEmployeeId: null } },
		{ upsert: true, new: true }
	);

	const idx = (Math.max(settings.assignmentCounter, 1) - 1) % employees.length;
	const nextEmployee = employees[idx];

	await AppSettings.updateOne(
		{ key: ASSIGNMENT_SETTINGS_KEY },
		{ lastAssignedEmployeeId: nextEmployee._id }
	);

	return nextEmployee;
}

module.exports = {
	ASSIGNMENT_SETTINGS_KEY,
	getActiveEmployees,
	pickNextEmployee,
};
