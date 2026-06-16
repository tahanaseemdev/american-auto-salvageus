require("dotenv").config();
const mongoose = require("mongoose");

const Role = require("../models/Role");
const AppSettings = require("../models/AppSettings");
const { EMPLOYEE_PERMISSIONS } = require("../constants/permissions");

async function run() {
	const mongoUri = process.env.MONGO_DB_CONNECTION_URL;
	if (!mongoUri) {
		throw new Error("MONGO_DB_CONNECTION_URL is missing in environment.");
	}

	await mongoose.connect(mongoUri);

	let employeeRole = await Role.findOne({ title: "Employee" });
	if (!employeeRole) {
		employeeRole = await Role.create({ title: "Employee", permissions: EMPLOYEE_PERMISSIONS });
		console.info("Created role: Employee");
	} else {
		employeeRole.permissions = EMPLOYEE_PERMISSIONS;
		await employeeRole.save();
		console.info("Updated role: Employee");
	}

	await AppSettings.findOneAndUpdate(
		{ key: "order_assignment" },
		{ $setOnInsert: { lastAssignedEmployeeId: null } },
		{ upsert: true, new: true }
	);
	console.info("Ensured AppSettings order_assignment document exists.");

	await mongoose.disconnect();
}

run().catch(async (err) => {
	console.error("Employee role seed failed:", err.message);
	try {
		await mongoose.disconnect();
	} catch {
		// ignore
	}
	process.exit(1);
});
