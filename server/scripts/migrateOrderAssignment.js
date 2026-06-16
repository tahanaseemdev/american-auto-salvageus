require("dotenv").config();
const mongoose = require("mongoose");

const Role = require("../models/Role");
const AppSettings = require("../models/AppSettings");
const Order = require("../models/Order");
const { ALL_PERMISSIONS, EMPLOYEE_PERMISSIONS } = require("../constants/permissions");

async function run() {
	const mongoUri = process.env.MONGO_DB_CONNECTION_URL;
	if (!mongoUri) {
		throw new Error("MONGO_DB_CONNECTION_URL is missing in environment.");
	}

	await mongoose.connect(mongoUri);

	let superAdminRole = await Role.findOne({ title: "Super Admin" });
	if (superAdminRole) {
		const merged = Array.from(new Set([...(superAdminRole.permissions || []), ...ALL_PERMISSIONS]));
		superAdminRole.permissions = merged;
		await superAdminRole.save();
		console.info("Updated Super Admin permissions.");
	}

	let employeeRole = await Role.findOne({ title: "Employee" });
	if (!employeeRole) {
		employeeRole = await Role.create({ title: "Employee", permissions: EMPLOYEE_PERMISSIONS });
		console.info("Created Employee role.");
	} else {
		employeeRole.permissions = EMPLOYEE_PERMISSIONS;
		await employeeRole.save();
		console.info("Updated Employee role.");
	}

	await AppSettings.findOneAndUpdate(
		{ key: "order_assignment" },
		{ $setOnInsert: { lastAssignedEmployeeId: null, assignmentCounter: 0 } },
		{ upsert: true, new: true }
	);
	console.info("Ensured AppSettings document.");

	const result = await Order.updateMany(
		{ assignmentStatus: { $exists: false } },
		{ $set: { assignmentHistory: [] } }
	);
	console.info(`Initialized assignment fields on ${result.modifiedCount} existing orders.`);

	console.info("Migration completed successfully.");
	await mongoose.disconnect();
}

run().catch(async (err) => {
	console.error("Migration failed:", err.message);
	try {
		await mongoose.disconnect();
	} catch {
		// ignore
	}
	process.exit(1);
});
