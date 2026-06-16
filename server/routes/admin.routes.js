const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");
const { checkAnyPermission } = require("../middleware/checkPermission");
const {
	getAllUsers,
	createAdminUser,
	updateUser,
	getRoles,
	createRole,
	updateRole,
	deleteRole,
	uploadImage,
} = require("../controllers/admin.controller");
const {
	adminGetAllOrders,
	getMyAssignedOrders,
	updateOrderStatus,
	updateAssignmentStatus,
} = require("../controllers/order.controller");
const {
	listEmployees,
	listAssignableEmployees,
	createEmployee,
	updateEmployee,
	resendEmployeeCredentials,
	deleteEmployee,
	reassignOrderToEmployee,
} = require("../controllers/employee.controller");
const { adminGetContactQueries, markContactQueryRead } = require("../controllers/contact.controller");
const upload = require("../middleware/upload");

// All admin routes require authentication
router.use(authenticate);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get("/users", checkPermission("manage_users"), getAllUsers);
router.post("/users", checkPermission("manage_users"), createAdminUser);
router.put("/users/:id", checkPermission("manage_users"), updateUser);

// ── Roles ─────────────────────────────────────────────────────────────────────
router.get("/roles", getRoles);  // Any authenticated admin can view roles
router.post("/roles", checkPermission("manage_roles"), createRole);
router.put("/roles/:id", checkPermission("manage_roles"), updateRole);
router.delete("/roles/:id", checkPermission("manage_roles"), deleteRole);

// ── Employees ─────────────────────────────────────────────────────────────────
router.get("/employees/assignable", checkPermission("edit_orders"), listAssignableEmployees);
router.get("/employees", checkPermission("manage_employees"), listEmployees);
router.post("/employees", checkPermission("manage_employees"), createEmployee);
router.patch("/employees/:id", checkPermission("manage_employees"), updateEmployee);
router.post("/employees/:id/resend-credentials", checkPermission("manage_employees"), resendEmployeeCredentials);
router.delete("/employees/:id", checkPermission("manage_employees"), deleteEmployee);

// ── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders/mine", checkPermission("view_assigned_orders"), getMyAssignedOrders);
router.get("/orders", checkAnyPermission("view_orders", "view_assigned_orders"), adminGetAllOrders);
router.patch("/orders/:id/status", checkPermission("edit_orders"), updateOrderStatus);
router.patch(
	"/orders/:id/assignment-status",
	checkAnyPermission("edit_orders", "edit_assigned_orders"),
	updateAssignmentStatus
);
router.patch("/orders/:id/reassign", checkPermission("edit_orders"), reassignOrderToEmployee);

// ── Contact Queries ───────────────────────────────────────────────────────────
router.get("/contact-queries", checkPermission("view_contact_queries"), adminGetContactQueries);
router.patch("/contact-queries/:id/read", checkPermission("view_contact_queries"), markContactQueryRead);

// ── Uploads ───────────────────────────────────────────────────────────────────
router.post("/uploads/image", upload.single("image"), uploadImage);

module.exports = router;
