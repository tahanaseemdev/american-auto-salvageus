const User = require("../models/User");
const Role = require("../models/Role");
const Order = require("../models/Order");
const ContactQuery = require("../models/ContactQuery");
const { sendJsonResponse } = require("../utils/helpers");
const { sendEmployeeWelcomeEmail } = require("../utils/mailer");
const { reassignOrder } = require("../services/orderAssignment.service");
const { ensureEmployeeSetup } = require("../utils/ensureEmployeeSetup");
const { generateTempPassword, applyTemporaryPassword } = require("../utils/employeeCredentials");

function deriveNameFromEmail(email) {
	const local = String(email).split("@")[0] || "Employee";
	return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function getEmployeeRole({ createIfMissing = false } = {}) {
	if (createIfMissing) {
		return ensureEmployeeSetup();
	}
	return Role.findOne({ title: "Employee" });
}

async function listEmployees(req, res, next) {
	try {
		const employeeRole = await getEmployeeRole();
		if (!employeeRole) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "No employees.", { employees: [] });
		}

		const employees = await User.find({ role: employeeRole._id })
			.select("-password")
			.sort({ employeeQueueOrder: 1, createdAt: 1 })
			.lean();

		const employeeIds = employees.map((e) => e._id);
		const [assignedCounts, openCounts, lastAssigned] = await Promise.all([
			Order.aggregate([
				{ $match: { assignedTo: { $in: employeeIds } } },
				{ $group: { _id: "$assignedTo", count: { $sum: 1 } } },
			]),
			Order.aggregate([
				{
					$match: {
						assignedTo: { $in: employeeIds },
						assignmentStatus: { $in: ["Assigned", "InProgress"] },
					},
				},
				{ $group: { _id: "$assignedTo", count: { $sum: 1 } } },
			]),
			Order.aggregate([
				{ $match: { assignedTo: { $in: employeeIds } } },
				{ $sort: { assignedAt: -1 } },
				{ $group: { _id: "$assignedTo", lastAssignedAt: { $first: "$assignedAt" } } },
			]),
		]);

		const countMap = Object.fromEntries(assignedCounts.map((r) => [String(r._id), r.count]));
		const openMap = Object.fromEntries(openCounts.map((r) => [String(r._id), r.count]));
		const lastMap = Object.fromEntries(lastAssigned.map((r) => [String(r._id), r.lastAssignedAt]));

		const enriched = employees.map((emp) => ({
			...emp,
			ordersAssigned: countMap[String(emp._id)] || 0,
			openOrders: openMap[String(emp._id)] || 0,
			lastAssignedAt: lastMap[String(emp._id)] || null,
		}));

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Employees fetched.", { employees: enriched });
	} catch (err) {
		next(err);
	}
}

async function createEmployee(req, res, next) {
	try {
		const { email, name } = req.body;
		if (!email) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Email is required.");
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const employeeRole = await getEmployeeRole({ createIfMissing: true });

		const exists = await User.findOne({ email: normalizedEmail });
		if (exists) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.CONFLICT, false, "A user with this email already exists.");
		}

		const tempPassword = generateTempPassword();
		const employeeName = (name || "").trim() || deriveNameFromEmail(normalizedEmail);

		const maxOrder = await User.findOne({ role: employeeRole._id }).sort({ employeeQueueOrder: -1 }).select("employeeQueueOrder").lean();
		const employeeQueueOrder = (maxOrder?.employeeQueueOrder ?? -1) + 1;

		const employee = await User.create({
			name: employeeName,
			email: normalizedEmail,
			password: tempPassword,
			role: employeeRole._id,
			mustChangePassword: true,
			isActiveForAssignment: true,
			employeeQueueOrder,
		});

		const verified = await employee.comparePassword(tempPassword);
		if (!verified) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "Failed to store employee credentials. Please try again.");
		}

		const emailResult = await sendEmployeeWelcomeEmail({ employee, tempPassword });

		const safe = employee.toJSON();
		const isLocal = process.env.ENVIRONMENT_STATUS === "local";

		if (emailResult.sent) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Employee created. Credentials sent by email.", {
				...safe,
				emailSent: true,
				...(isLocal ? { tempPassword } : {}),
			});
		}

		const responseData = {
			...safe,
			emailSent: false,
			emailError: emailResult.message,
			...(isLocal ? { tempPassword } : {}),
		};

		const message = emailResult.skipped
			? "Employee created, but email was not sent (SMTP not configured). Add SMTP settings to server/.env."
			: `Employee created, but email failed to send: ${emailResult.message}`;

		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, message, responseData);
	} catch (err) {
		next(err);
	}
}

async function updateEmployee(req, res, next) {
	try {
		const employeeRole = await getEmployeeRole();
		const employee = await User.findOne({ _id: req.params.id, role: employeeRole?._id });
		if (!employee) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Employee not found.");
		}

		const { name, isActiveForAssignment, isRevoked, employeeQueueOrder } = req.body;
		if (name !== undefined) employee.name = String(name).trim();
		if (isRevoked !== undefined) employee.isRevoked = Boolean(isRevoked);
		if (isRevoked === false) {
			employee.isActiveForAssignment = true;
		}
		if (isActiveForAssignment !== undefined) employee.isActiveForAssignment = Boolean(isActiveForAssignment);
		if (employeeQueueOrder !== undefined) employee.employeeQueueOrder = Number(employeeQueueOrder);

		await employee.save();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Employee updated.", employee.toJSON());
	} catch (err) {
		next(err);
	}
}

async function resendEmployeeCredentials(req, res, next) {
	try {
		const employeeRole = await getEmployeeRole({ createIfMissing: true });
		const employee = await User.findById(req.params.id);
		if (!employee || String(employee.role) !== String(employeeRole._id)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Employee not found.");
		}

		const tempPassword = generateTempPassword();
		await applyTemporaryPassword(employee, tempPassword);

		const emailResult = await sendEmployeeWelcomeEmail({ employee, tempPassword });
		const isLocal = process.env.ENVIRONMENT_STATUS === "local";

		if (emailResult.sent) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Credentials resent by email. Previous temporary password no longer works.", {
				_id: employee._id,
				email: employee.email,
				emailSent: true,
				...(isLocal ? { tempPassword } : {}),
			});
		}

		const message = emailResult.skipped
			? "Email not sent — SMTP is not configured in server/.env."
			: `Email failed: ${emailResult.message}`;

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, message, {
			_id: employee._id,
			emailSent: false,
			...(isLocal ? { tempPassword } : {}),
		});
	} catch (err) {
		next(err);
	}
}

async function listAssignableEmployees(req, res, next) {
	try {
		const employeeRole = await getEmployeeRole({ createIfMissing: true });
		const employees = await User.find({
			role: employeeRole._id,
			isRevoked: false,
			isActiveForAssignment: true,
		})
			.select("name email")
			.sort({ employeeQueueOrder: 1, createdAt: 1 })
			.lean();

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Assignable employees fetched.", { employees });
	} catch (err) {
		next(err);
	}
}

async function deleteEmployee(req, res, next) {
	try {
		const employeeRole = await getEmployeeRole();
		const employee = await User.findOne({ _id: req.params.id, role: employeeRole?._id });
		if (!employee) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Employee not found.");
		}

		const openOrders = await Order.find({
			assignedTo: employee._id,
			assignmentStatus: { $in: ["Assigned", "InProgress"] },
		}).select("_id orderNumber");

		const openContacts = await ContactQuery.find({
			assignedTo: employee._id,
			assignmentStatus: { $in: ["Assigned", "InProgress"] },
		}).select("_id subject");

		if (openOrders.length > 0) {
			const now = new Date();
			await Promise.all(
				openOrders.map((order) =>
					Order.findByIdAndUpdate(order._id, {
						assignedTo: null,
						assignedAt: null,
						assignmentStatus: null,
						$push: {
							assignmentHistory: {
								from: employee._id,
								to: null,
								by: req.user._id,
								action: "unassigned_on_employee_delete",
								note: `Employee ${employee.name} was deleted; order unassigned`,
								at: now,
							},
						},
					})
				)
			);
		}

		if (openContacts.length > 0) {
			const now = new Date();
			await Promise.all(
				openContacts.map((contact) =>
					ContactQuery.findByIdAndUpdate(contact._id, {
						assignedTo: null,
						assignedAt: null,
						assignmentStatus: null,
						$push: {
							assignmentHistory: {
								from: employee._id,
								to: null,
								by: req.user._id,
								action: "unassigned_on_employee_delete",
								note: `Employee ${employee.name} was deleted; lead unassigned`,
								at: now,
							},
						},
					})
				)
			);
		}

		await User.findByIdAndDelete(employee._id);

		const parts = [];
		if (openOrders.length > 0) parts.push(`${openOrders.length} open order(s) unassigned`);
		if (openContacts.length > 0) parts.push(`${openContacts.length} open lead(s) unassigned`);
		const message = parts.length
			? `Employee deleted. ${parts.join("; ")}.`
			: "Employee deleted.";

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, message, {
			_id: employee._id,
			unassignedOrders: openOrders.length,
			unassignedContacts: openContacts.length,
		});
	} catch (err) {
		next(err);
	}
}

async function reassignOrderToEmployee(req, res, next) {
	try {
		const { employeeId, note } = req.body;
		if (!employeeId) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "employeeId is required.");
		}

		const result = await reassignOrder(req.params.id, employeeId, req.user._id, note, note);
		const order = await Order.findById(result.order._id)
			.populate("assignedTo", "name email")
			.populate("user", "name email")
			.lean();

		return sendJsonResponse(
			res,
			HTTP_STATUS_CODES.OK,
			true,
			"Order assigned. Employee and admin notified by email.",
			order
		);
	} catch (err) {
		if (err.message === "Order not found.") {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, err.message);
		}
		if (err.message === "Invalid employee for reassignment.") {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, err.message);
		}
		next(err);
	}
}

module.exports = {
	listEmployees,
	listAssignableEmployees,
	createEmployee,
	updateEmployee,
	resendEmployeeCredentials,
	deleteEmployee,
	reassignOrderToEmployee,
};
