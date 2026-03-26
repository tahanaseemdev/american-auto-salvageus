const router = require("express").Router();
const { register, login, adminLogin, logout, forgotPassword, resetPassword } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/admin/login", adminLogin);
router.post("/logout", logout);

module.exports = router;
