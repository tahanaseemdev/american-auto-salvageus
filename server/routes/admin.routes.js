const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");
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
const { adminGetAllOrders, updateOrderStatus } = require("../controllers/order.controller");
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

// ── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders", checkPermission("view_orders"), adminGetAllOrders);
router.patch("/orders/:id/status", checkPermission("edit_orders"), updateOrderStatus);

// ── Contact Queries ───────────────────────────────────────────────────────────
router.get("/contact-queries", checkPermission("view_contact_queries"), adminGetContactQueries);
router.patch("/contact-queries/:id/read", checkPermission("view_contact_queries"), markContactQueryRead);

// ── Uploads ───────────────────────────────────────────────────────────────────
router.post("/uploads/image", upload.single("image"), uploadImage);

module.exports = router;
