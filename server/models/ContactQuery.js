const mongoose = require("mongoose");

const contactQuerySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true, lowercase: true },
		phone: { type: String, default: "", trim: true },
		subject: { type: String, required: true, trim: true },
		message: { type: String, required: true, trim: true },
		isRead: { type: Boolean, default: false },
		readAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

const ContactQuery = mongoose.model("ContactQuery", contactQuerySchema);
module.exports = ContactQuery;
