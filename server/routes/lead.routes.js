const router = require("express").Router();
const { createIncomingLead } = require("../controllers/lead.controller");
const { leadWebhookAuth } = require("../middleware/leadWebhookAuth");

router.post("/incoming", leadWebhookAuth, createIncomingLead);

module.exports = router;
