const router = require("express").Router();
const { models, years, trims } = require("../controllers/catalog.controller");
const { authenticate } = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");

router.get("/models", models.getAll);
router.get("/years", years.getAll);
router.get("/trims", trims.getAll);

router.get("/models/admin/all", authenticate, checkPermission("view_models"), models.getAllAdmin);
router.post("/models", authenticate, checkPermission("edit_models"), models.create);
router.put("/models/:id", authenticate, checkPermission("edit_models"), models.update);
router.delete("/models/:id", authenticate, checkPermission("edit_models"), models.remove);

router.get("/years/admin/all", authenticate, checkPermission("view_years"), years.getAllAdmin);
router.post("/years", authenticate, checkPermission("edit_years"), years.create);
router.put("/years/:id", authenticate, checkPermission("edit_years"), years.update);
router.delete("/years/:id", authenticate, checkPermission("edit_years"), years.remove);

router.get("/trims/admin/all", authenticate, checkPermission("view_trims"), trims.getAllAdmin);
router.post("/trims", authenticate, checkPermission("edit_trims"), trims.create);
router.put("/trims/:id", authenticate, checkPermission("edit_trims"), trims.update);
router.delete("/trims/:id", authenticate, checkPermission("edit_trims"), trims.remove);

module.exports = router;
