const router = require("express").Router();
const { getProducts, getProductById, adminGetAll, createProduct, updateProduct, deleteProduct } = require("../controllers/product.controller");
const { authenticate } = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");

// Public routes
router.get("/", getProducts);

// Admin-protected routes
router.get("/admin/all", authenticate, checkPermission("view_products"), adminGetAll);
router.post("/", authenticate, checkPermission("edit_products"), createProduct);
router.put("/:id", authenticate, checkPermission("edit_products"), updateProduct);
router.delete("/:id", authenticate, checkPermission("edit_products"), deleteProduct);
router.get("/:id", getProductById);

module.exports = router;
