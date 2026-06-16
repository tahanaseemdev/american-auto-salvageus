const crypto = require("crypto");

// Unambiguous chars only (no 0/O, 1/l/I) — easier to copy from email
const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generateTempPassword(length = 12) {
	let result = "";
	const bytes = crypto.randomBytes(length);
	for (let i = 0; i < length; i += 1) {
		result += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
	}
	return result;
}

async function applyTemporaryPassword(user, plainPassword) {
	user.password = plainPassword;
	user.mustChangePassword = true;
	user.markModified("password");
	await user.save();

	const verified = await user.comparePassword(plainPassword);
	if (!verified) {
		throw new Error("Stored password does not match generated credentials.");
	}
	return user;
}

module.exports = { generateTempPassword, applyTemporaryPassword };
