require("dotenv").config();
const { isSmtpConfigured, createMailerTransport, sendEmployeeWelcomeEmail } = require("../utils/mailer");

async function run() {
	const to = process.argv[2] || process.env.SMTP_USER;

	if (!isSmtpConfigured()) {
		console.error("SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env");
		process.exit(1);
	}

	const transport = createMailerTransport();
	try {
		await transport.verify();
		console.info("SMTP connection verified.");
	} catch (err) {
		console.error("SMTP verify failed:", err.message);
		console.error("For Gmail, use an App Password (not your regular password).");
		process.exit(1);
	}

	if (!to) {
		console.info("SMTP OK. Pass a recipient email to send a test: node scripts/testSmtp.js you@example.com");
		return;
	}

	const result = await sendEmployeeWelcomeEmail({
		employee: { name: "Test Employee", email: to },
		tempPassword: "TestPass123!",
	});

	if (result.sent) {
		console.info(`Test email sent to ${to}`);
	} else {
		console.error("Send failed:", result.message);
		process.exit(1);
	}
}

run().catch((err) => {
	console.error(err.message);
	process.exit(1);
});
