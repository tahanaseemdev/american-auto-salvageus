const router = require("express").Router();
const { register, login, adminLogin, logout, forgotPassword, resetPassword, adminChangePassword } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/admin/login", adminLogin);
router.post("/admin/change-password", authenticate, adminChangePassword);
router.post("/logout", logout);

module.exports = router;
