const router = require("express").Router();
const { submitContactQuery } = require("../controllers/contact.controller");

router.post("/", submitContactQuery);

module.exports = router;
