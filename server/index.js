// index.js
require("dotenv").config();
require("./utils/constants.js");
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const { sendJsonResponse } = require("./utils/helpers");
const multer = require("multer");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Raw endpoints — must be registered BEFORE body parsers
app.post("/v1/payments/webhook", express.raw({ type: "application/json" }));

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "assets", "uploads")));

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

const environmentStatus = process.env.ENVIRONMENT_STATUS;

const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (Postman, curl, server-to-server)
		if (!origin) return callback(null, true);
		// In local/dev mode, allow all origins so testing is frictionless
		if (environmentStatus === "local") return callback(null, true);
		// Production: enforce whitelist
		if (allowedOrigins.includes(origin)) return callback(null, true);
		callback(new Error(`CORS: origin "${origin}" not allowed`));
	},
	credentials: true,
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
	.connect(process.env.MONGO_DB_CONNECTION_URL)
	.then(() => {
		console.log("Connecting to:", process.env.MONGO_DB_CONNECTION_URL);
		console.info(`Database connected successfully`);
	})
	.catch((err) => {
		console.error("Database connection error:", err);
		process.exit(1);
	});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Welcome to the American Auto Salvage US API"));
app.get("/v1", (req, res) => res.send("API version 1 — online"));

app.use("/v1/auth", require("./routes/auth.routes"));
app.use("/v1/user", require("./routes/user.routes"));
app.use("/v1/categories", require("./routes/category.routes"));
app.use("/v1/parts", require("./routes/category.routes"));
app.use("/v1/products", require("./routes/product.routes"));
app.use("/v1/catalog", require("./routes/catalog.routes"));
app.use("/v1/orders", require("./routes/order.routes"));
app.use("/v1/contact", require("./routes/contact.routes"));
app.use("/v1/admin", require("./routes/admin.routes"));

// ── Error Handling ─────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
	console.error(err);
	if (err instanceof multer.MulterError) {
		return sendJsonResponse(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, false, "File upload error.", err.message);
	}
	return sendJsonResponse(
		res,
		HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
		false,
		"An unexpected error occurred.",
		process.env.ENVIRONMENT_STATUS !== "production" ? err.message : undefined
	);
});

server.listen(PORT, () => {
	console.info(`Server running on http://localhost:${PORT}`);
	console.info(`Environment: ${environmentStatus}`);
});
