const Role = require("../models/Role");
const AppSettings = require("../models/AppSettings");
const { EMPLOYEE_PERMISSIONS } = require("../constants/permissions");

const SETTINGS_KEY = "order_assignment";
const CONTACT_SETTINGS_KEY = "contact_assignment";

async function ensureEmployeeRole() {
	let role = await Role.findOne({ title: "Employee" });
	if (!role) {
		role = await Role.create({ title: "Employee", permissions: EMPLOYEE_PERMISSIONS });
	} else {
		role.permissions = EMPLOYEE_PERMISSIONS;
		await role.save();
	}
	return role;
}

async function ensureAssignmentSettings() {
	await AppSettings.findOneAndUpdate(
		{ key: SETTINGS_KEY },
		{ $setOnInsert: { lastAssignedEmployeeId: null, assignmentCounter: 0 } },
		{ upsert: true, new: true }
	);
	await AppSettings.findOneAndUpdate(
		{ key: CONTACT_SETTINGS_KEY },
		{ $setOnInsert: { lastAssignedEmployeeId: null, assignmentCounter: 0 } },
		{ upsert: true, new: true }
	);
}

async function ensureEmployeeSetup() {
	const [role] = await Promise.all([ensureEmployeeRole(), ensureAssignmentSettings()]);
	return role;
}

module.exports = { ensureEmployeeRole, ensureAssignmentSettings, ensureEmployeeSetup };
