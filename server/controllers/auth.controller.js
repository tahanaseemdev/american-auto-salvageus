const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { sendJsonResponse } = require("../utils/helpers");

const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: "lax",
	secure: process.env.ENVIRONMENT_STATUS === "production",
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function signToken(userId) {
	return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function getResetTokenExpiryMinutes() {
	const parsed = Number(process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINUTES || 30);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
}

function resolveWebsiteBaseUrl() {
	if (process.env.WEBSITE_URL) return process.env.WEBSITE_URL;
	if (process.env.CLIENT_URL) return process.env.CLIENT_URL;

	const firstOrigin = (process.env.ALLOWED_ORIGINS || "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)[0];

	return firstOrigin || "http://localhost:5173";
}

function buildResetEmailHtml(resetLink, expiryMinutes) {
	const templatePath = path.join(__dirname, "..", "utils", "emailTemplates", "resetPassword.html");
	if (!fs.existsSync(templatePath)) {
		return `
			<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
				<h2 style="margin-bottom:12px">Reset your password</h2>
				<p>We received a request to reset your password.</p>
				<p>
					<a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#f59e0b;color:#111827;text-decoration:none;border-radius:8px;font-weight:700">
						Reset password
					</a>
				</p>
				<p>This link expires in ${expiryMinutes} minutes.</p>
			</div>
		`;
	}

	let html = fs.readFileSync(templatePath, "utf8");
	html = html.replace(/\{\{passwordResetLink\}\}/g, resetLink);
	html = html.replace(/\{\{expiresAt\}\}/g, `${expiryMinutes} minutes`);
	return html;
}

function createMailerTransport() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 587);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

	if (!host || !user || !pass) {
		return null;
	}

	return nodemailer.createTransport({
		host,
		port,
		secure: Number(port) === 465,
		auth: { user, pass },
	});
}

async function sendResetPasswordEmail(toEmail, resetLink, expiryMinutes) {
	const transport = createMailerTransport();
	if (!transport) return false;

	const senderName = process.env.EMAIL_SENDER_NAME || process.env.SMTP_SENDER_NAME;
	const senderEmail = process.env.SMTP_FROM || process.env.EMAIL_SENDER || process.env.SMTP_USER;
	const from = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail;
	await transport.sendMail({
		from,
		to: toEmail,
		subject: "Password reset request",
		html: buildResetEmailHtml(resetLink, expiryMinutes),
	});
	return true;
}

async function register(req, res, next) {
	try {
		const { firstName, lastName, email, phone, password } = req.body;

		if (!firstName || !lastName || !email || !password) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "firstName, lastName, email, and password are required.");
		}

		const exists = await User.findOne({ email: email.toLowerCase().trim() });
		if (exists) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.CONFLICT, false, "An account with this email already exists.");
		}

		const user = await User.create({
			name: `${firstName.trim()} ${lastName.trim()}`,
			email: email.trim(),
			phone: phone?.trim() || "",
			password,
		});

		const token = signToken(user._id);
		res.cookie("token", token, COOKIE_OPTIONS);

		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Account created successfully.", {
			token,
			user: { _id: user._id, name: user.name, email: user.email, role: null },
		});
	} catch (err) {
		next(err);
	}
}

async function login(req, res, next) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Email and password are required.");
		}

		const user = await User.findOne({ email: email.toLowerCase().trim() }).populate("role");
		if (!user || !(await user.comparePassword(password))) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Invalid email or password.");
		}

		if (user.isRevoked) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.FORBIDDEN, false, "Your account has been suspended. Please contact support.");
		}

		const token = signToken(user._id);
		res.cookie("token", token, COOKIE_OPTIONS);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Logged in successfully.", {
			token,
			user: { _id: user._id, name: user.name, email: user.email, role: user.role },
		});
	} catch (err) {
		next(err);
	}
}

async function adminLogin(req, res, next) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Email and password are required.");
		}

		const user = await User.findOne({ email: email.toLowerCase().trim() }).populate("role");
		if (!user || !(await user.comparePassword(password))) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, "Invalid credentials.");
		}

		if (user.isRevoked) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.FORBIDDEN, false, "Account has been revoked.");
		}

		// Only users with an assigned role can access the admin panel
		if (!user.role) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.FORBIDDEN, false, "No admin role assigned to this account.");
		}

		const token = signToken(user._id);
		res.cookie("adminToken", token, COOKIE_OPTIONS);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Admin login successful.", {
			token,
			user: { _id: user._id, name: user.name, email: user.email, role: user.role },
		});
	} catch (err) {
		next(err);
	}
}

function logout(req, res) {
	res.clearCookie("token");
	res.clearCookie("adminToken");
	return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Logged out.");
}

async function forgotPassword(req, res, next) {
	try {
		const { email } = req.body;
		if (!email) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Email is required.");
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const user = await User.findOne({ email: normalizedEmail });
		const genericMessage = "If an account with that email exists, a reset link has been sent.";

		if (!user) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, genericMessage);
		}

		const expiryMinutes = getResetTokenExpiryMinutes();
		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

		user.resetPasswordTokenHash = resetTokenHash;
		user.resetPasswordExpiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
		await user.save();

		const websiteBaseUrl = resolveWebsiteBaseUrl().replace(/\/$/, "");
		const resetLink = `${websiteBaseUrl}/reset-password?token=${resetToken}`;
		const emailSent = await sendResetPasswordEmail(user.email, resetLink, expiryMinutes);

		const responseData =
			process.env.ENVIRONMENT_STATUS === "local" && !emailSent ? { resetToken, resetLink } : undefined;

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, genericMessage, responseData);
	} catch (err) {
		next(err);
	}
}

async function resetPassword(req, res, next) {
	try {
		const { token, password } = req.body;
		if (!token || !password) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "token and password are required.");
		}

		if (String(password).length < 8) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Password must be at least 8 characters.");
		}

		const hashedToken = crypto.createHash("sha256").update(String(token)).digest("hex");
		const user = await User.findOne({
			resetPasswordTokenHash: hashedToken,
			resetPasswordExpiresAt: { $gt: new Date() },
		});

		if (!user) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Reset link is invalid or expired.");
		}

		user.password = String(password);
		user.resetPasswordTokenHash = null;
		user.resetPasswordExpiresAt = null;
		await user.save();

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Password reset successfully.");
	} catch (err) {
		next(err);
	}
}

module.exports = { register, login, adminLogin, logout, forgotPassword, resetPassword };
