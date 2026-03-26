const User = require("../models/User");
const Role = require("../models/Role");
const { sendJsonResponse } = require("../utils/helpers");

// ── Users ─────────────────────────────────────────────────────────────────────

async function getAllUsers(req, res, next) {
	try {
		const { page = 1, limit = 20, q } = req.query;
		const filter = {};
		if (q) {
			filter.$or = [
				{ name: { $regex: q, $options: "i" } },
				{ email: { $regex: q, $options: "i" } },
			];
		}

		const skip = (Number(page) - 1) * Number(limit);
		const [users, total] = await Promise.all([
			User.find(filter)
				.populate("role", "title")
				.select("-password")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			User.countDocuments(filter),
		]);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Users fetched.", {
			users,
			pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
		});
	} catch (err) {
		next(err);
	}
}

async function createAdminUser(req, res, next) {
	try {
		const { name, email, password, roleId } = req.body;
		if (!name || !email || !password) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "name, email, and password are required.");
		}

		const exists = await User.findOne({ email: email.toLowerCase().trim() });
		if (exists) return sendJsonResponse(res, HTTP_STATUS_CODES.CONFLICT, false, "Email already exists.");

		const user = await User.create({ name, email, password, role: roleId || null });
		await user.populate("role", "title");
		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "User created.", user);
	} catch (err) {
		next(err);
	}
}

async function updateUser(req, res, next) {
	try {
		const { name, email, roleId } = req.body;
		const updates = {};
		if (name) updates.name = name;
		if (email) updates.email = email.toLowerCase().trim();
		if (roleId !== undefined) updates.role = roleId || null;

		const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
			.populate("role", "title")
			.select("-password");
		if (!user) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "User not found.");
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "User updated.", user);
	} catch (err) {
		next(err);
	}
}

// ── Roles ─────────────────────────────────────────────────────────────────────

async function getRoles(req, res, next) {
	try {
		const roles = await Role.find().sort({ title: 1 }).lean();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Roles fetched.", roles);
	} catch (err) {
		next(err);
	}
}

async function createRole(req, res, next) {
	try {
		const { title, permissions = [] } = req.body;
		if (!title) return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "title is required.");
		const role = await Role.create({ title, permissions });
		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Role created.", role);
	} catch (err) {
		if (err.code === 11000) return sendJsonResponse(res, HTTP_STATUS_CODES.CONFLICT, false, "Role title already exists.");
		next(err);
	}
}

async function updateRole(req, res, next) {
	try {
		const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!role) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Role not found.");
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Role updated.", role);
	} catch (err) {
		next(err);
	}
}

async function deleteRole(req, res, next) {
	try {
		await Role.findByIdAndDelete(req.params.id);
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Role deleted.");
	} catch (err) {
		next(err);
	}
}

// ── Uploads ───────────────────────────────────────────────────────────────────

async function uploadImage(req, res, next) {
	try {
		if (!req.file) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Image file is required.");
		}

		const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Image uploaded.", {
			filename: req.file.filename,
			imageUrl,
		});
	} catch (err) {
		next(err);
	}
}

module.exports = {
	getAllUsers,
	createAdminUser,
	updateUser,
	getRoles,
	createRole,
	updateRole,
	deleteRole,
	uploadImage,
};
