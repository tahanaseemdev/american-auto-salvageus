const Order = require("../models/Order");
const User = require("../models/User");
const {
	sendOrderAssignedEmployeeEmail,
	sendOrderAssignedAdminEmail,
} = require("../utils/mailer");
// Shared with contactAssignment.service so orders and contact queries advance
// the same round-robin counter rather than each rotating on its own.
const { getActiveEmployees, pickNextEmployee } = require("./assignmentQueue.service");

async function assignOrderToEmployee(orderId, employee, { action = "round_robin", by = null, note = "", employeeNotes = null } = {}) {
	const now = new Date();
	const update = {
		assignedTo: employee._id,
		assignedAt: now,
		assignmentStatus: "Assigned",
		$push: {
			assignmentHistory: {
				from: null,
				to: employee._id,
				by,
				action,
				note,
				at: now,
			},
		},
	};
	if (employeeNotes !== null && employeeNotes !== undefined) {
		update.employeeNotes = String(employeeNotes).trim();
	}

	const order = await Order.findByIdAndUpdate(orderId, update, { new: true }).lean();

	return order;
}

async function assignOrderRoundRobin(orderId, products) {
	const employees = await getActiveEmployees();
	if (!employees.length) {
		console.warn(`No active employees for order assignment: ${orderId}`);
		return null;
	}

	const nextEmployee = await pickNextEmployee(employees);
	if (!nextEmployee) return null;

	const order = await assignOrderToEmployee(orderId, nextEmployee, {
		action: "round_robin",
		note: "Auto-assigned via round-robin",
	});

	try {
		await Promise.all([
			sendOrderAssignedEmployeeEmail({
				order,
				employee: nextEmployee,
				products,
				assignmentType: "round-robin",
			}),
			sendOrderAssignedAdminEmail({
				order,
				employee: nextEmployee,
				assignmentType: "round-robin",
			}),
		]);
	} catch (emailError) {
		console.error("Assignment email failed:", emailError?.message || emailError);
	}

	return { order, employee: nextEmployee };
}

async function reassignOrder(orderId, employeeId, byUserId, note = "", employeeNotes = null) {
	const employee = await User.findOne({
		_id: employeeId,
		isRevoked: false,
		isActiveForAssignment: true,
	})
		.populate("role", "title")
		.lean();

	if (!employee || employee.role?.title !== "Employee") {
		throw new Error("Invalid employee for reassignment.");
	}

	const existing = await Order.findById(orderId).lean();
	if (!existing) throw new Error("Order not found.");

	const isFirstAssignment = !existing.assignedTo;
	const action = isFirstAssignment ? "manual_assign" : "manual_reassign";
	const historyNote = note || (isFirstAssignment ? "Manually assigned by admin" : "Manually reassigned by admin");

	const now = new Date();
	const update = {
		assignedTo: employee._id,
		assignedAt: now,
		assignmentStatus: "Assigned",
		$push: {
			assignmentHistory: {
				from: existing.assignedTo || null,
				to: employee._id,
				by: byUserId,
				action,
				note: historyNote,
				at: now,
			},
		},
	};
	if (employeeNotes !== null && employeeNotes !== undefined && String(employeeNotes).trim()) {
		update.employeeNotes = String(employeeNotes).trim();
	}

	const order = await Order.findByIdAndUpdate(orderId, update, { new: true }).lean();

	const assignmentType = isFirstAssignment ? "manual assignment" : "manual reassignment";

	try {
		await Promise.all([
			sendOrderAssignedEmployeeEmail({
				order,
				employee,
				products: order.products,
				assignmentType,
				adminNote: note || "",
			}),
			sendOrderAssignedAdminEmail({
				order,
				employee,
				assignmentType,
				adminNote: note || "",
			}),
		]);
	} catch (emailError) {
		console.error("Reassignment email failed:", emailError?.message || emailError);
	}

	return { order, employee };
}

module.exports = {
	getActiveEmployees,
	assignOrderRoundRobin,
	reassignOrder,
	assignOrderToEmployee,
};
