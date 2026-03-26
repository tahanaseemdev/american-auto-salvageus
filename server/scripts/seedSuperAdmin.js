require("dotenv").config();
const mongoose = require("mongoose");

const Role = require("../models/Role");
const User = require("../models/User");

const ALL_PERMISSIONS = [
	"view_categories",
	"edit_categories",
	"view_sub_categories",
	"edit_sub_categories",
	"view_models",
	"edit_models",
	"view_years",
	"edit_years",
	"view_trims",
	"edit_trims",
	"view_products",
	"edit_products",
	"view_orders",
	"edit_orders",
	"view_contact_queries",
	"manage_users",
	"manage_roles",
];

function getArg(name) {
	const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
	if (!arg) return "";
	return arg.slice(name.length + 3).trim();
}

async function run() {
	const mongoUri = process.env.MONGO_DB_CONNECTION_URL;
	if (!mongoUri) {
		throw new Error("MONGO_DB_CONNECTION_URL is missing in environment.");
	}

	const email = (getArg("email") || process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();
	const password = getArg("password") || process.env.SUPER_ADMIN_PASSWORD || "";
	const name = getArg("name") || process.env.SUPER_ADMIN_NAME || "Super Admin";

	if (!email || !password) {
		throw new Error(
			"Email and password are required. Pass --email and --password, or set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env"
		);
	}

	await mongoose.connect(mongoUri);

	let role = await Role.findOne({ title: "Super Admin" });
	if (!role) {
		role = await Role.create({ title: "Super Admin", permissions: ALL_PERMISSIONS });
		console.info("Created role: Super Admin");
	} else {
		const mergedPermissions = Array.from(new Set([...(role.permissions || []), ...ALL_PERMISSIONS]));
		role.permissions = mergedPermissions;
		await role.save();
		console.info("Updated role: Super Admin");
	}

	let user = await User.findOne({ email });
	if (!user) {
		user = await User.create({
			name,
			email,
			password,
			role: role._id,
			isRevoked: false,
		});
		console.info(`Created super admin user: ${email}`);
	} else {
		user.name = name || user.name;
		user.role = role._id;
		user.isRevoked = false;
		// Re-hash is handled by User model pre-save hook when password is modified.
		user.password = password;
		await user.save();
		console.info(`Updated existing user as super admin: ${email}`);
	}

	console.info("Super admin bootstrap completed successfully.");
	await mongoose.disconnect();
}

run()
	.catch(async (err) => {
		console.error("Super admin bootstrap failed:", err.message);
		try {
			await mongoose.disconnect();
		} catch {
			// ignore disconnect errors
		}
		process.exit(1);
	});
