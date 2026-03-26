const router = require("express").Router();
const {
	getAllCategories,
	getCategoryDetail,
	adminGetAll,
	createCategory,
	updateCategory,
	deleteCategory,
	createSubCategory,
	getSubCategories,
	updateSubCategory,
	deleteSubCategory,
} = require("../controllers/category.controller");
const { authenticate } = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");

// Public routes
router.get("/", getAllCategories);

// Sub-categories (public read, admin write)
router.get("/sub/list", getSubCategories);

// Admin-protected routes
router.get("/admin/all", authenticate, checkPermission("view_categories"), adminGetAll);
router.get("/sub/admin/list", authenticate, checkPermission("view_sub_categories"), getSubCategories);
router.post("/", authenticate, checkPermission("edit_categories"), createCategory);
router.put("/:id", authenticate, checkPermission("edit_categories"), updateCategory);
router.delete("/:id", authenticate, checkPermission("edit_categories"), deleteCategory);

router.post("/sub", authenticate, checkPermission("edit_sub_categories"), createSubCategory);
router.put("/sub/:id", authenticate, checkPermission("edit_sub_categories"), updateSubCategory);
router.delete("/sub/:id", authenticate, checkPermission("edit_sub_categories"), deleteSubCategory);

router.get("/:id", getCategoryDetail);

module.exports = router;
