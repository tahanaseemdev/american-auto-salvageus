const ContactQuery = require("../models/ContactQuery");
const User = require("../models/User");
const {
	sendContactAssignedEmployeeEmail,
	sendContactAssignedAdminEmail,
} = require("../utils/mailer");
// Shared with orderAssignment.service so orders and contact queries advance the
// same round-robin counter rather than each rotating on its own.
const { getActiveEmployees, pickNextEmployee } = require("./assignmentQueue.service");

async function assignContactToEmployee(contactId, employee, { action = "round_robin", by = null, note = "", employeeNotes = null } = {}) {
	const now = new Date();
	const update = {
		assignedTo: employee._id,
		assignedAt: now,
		assignmentStatus: "Assigned",
		isRead: false,
		readAt: null,
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

	const contact = await ContactQuery.findByIdAndUpdate(contactId, update, { new: true }).lean();
	return contact;
}

async function assignContactRoundRobin(contactId) {
	const employees = await getActiveEmployees();
	if (!employees.length) {
		console.warn(`No active employees for contact assignment: ${contactId}`);
		return null;
	}

	const nextEmployee = await pickNextEmployee(employees);
	if (!nextEmployee) return null;

	const contact = await assignContactToEmployee(contactId, nextEmployee, {
		action: "round_robin",
		note: "Auto-assigned via round-robin",
	});

	try {
		await Promise.all([
			sendContactAssignedEmployeeEmail({
				contact,
				employee: nextEmployee,
				assignmentType: "round-robin",
			}),
			sendContactAssignedAdminEmail({
				contact,
				employee: nextEmployee,
				assignmentType: "round-robin",
			}),
		]);
	} catch (emailError) {
		console.error("Contact assignment email failed:", emailError?.message || emailError);
	}

	return { contact, employee: nextEmployee };
}

async function reassignContact(contactId, employeeId, byUserId, note = "", employeeNotes = null) {
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

	const existing = await ContactQuery.findById(contactId).lean();
	if (!existing) throw new Error("Contact query not found.");

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

	const contact = await ContactQuery.findByIdAndUpdate(contactId, update, { new: true }).lean();
	const assignmentType = isFirstAssignment ? "manual assignment" : "manual reassignment";

	try {
		await Promise.all([
			sendContactAssignedEmployeeEmail({
				contact,
				employee,
				assignmentType,
				adminNote: note || "",
			}),
			sendContactAssignedAdminEmail({
				contact,
				employee,
				assignmentType,
				adminNote: note || "",
			}),
		]);
	} catch (emailError) {
		console.error("Contact reassignment email failed:", emailError?.message || emailError);
	}

	return { contact, employee };
}

module.exports = {
	getActiveEmployees,
	assignContactRoundRobin,
	reassignContact,
	assignContactToEmployee,
};
