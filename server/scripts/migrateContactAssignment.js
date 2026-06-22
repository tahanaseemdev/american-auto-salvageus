require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("../models/Role");
const AppSettings = require("../models/AppSettings");
const { EMPLOYEE_PERMISSIONS } = require("../constants/permissions");

async function run() {
	const mongoUri = process.env.MONGO_DB_CONNECTION_URL;
	if (!mongoUri) throw new Error("MONGO_DB_CONNECTION_URL is missing.");

	await mongoose.connect(mongoUri);

	const employeeRole = await Role.findOneAndUpdate(
		{ title: "Employee" },
		{ $set: { permissions: EMPLOYEE_PERMISSIONS } },
		{ upsert: true, new: true }
	);
	console.info("Employee role permissions updated:", employeeRole.permissions.join(", "));

	await AppSettings.findOneAndUpdate(
		{ key: "contact_assignment" },
		{ $setOnInsert: { lastAssignedEmployeeId: null, assignmentCounter: 0 } },
		{ upsert: true, new: true }
	);
	console.info("Ensured AppSettings contact_assignment document.");

	await mongoose.disconnect();
}

run().catch(async (err) => {
	console.error("Contact assignment migration failed:", err.message);
	try {
		await mongoose.disconnect();
	} catch {
		// ignore
	}
	process.exit(1);
});
