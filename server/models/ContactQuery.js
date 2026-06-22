const mongoose = require("mongoose");

const assignmentHistorySchema = new mongoose.Schema(
	{
		from: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		action: { type: String, required: true },
		note: { type: String, default: "" },
		at: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const contactQuerySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true, lowercase: true },
		phone: { type: String, default: "", trim: true },
		subject: { type: String, required: true, trim: true },
		message: { type: String, required: true, trim: true },
		source: { type: String, default: "website", trim: true },
		isRead: { type: Boolean, default: false },
		readAt: { type: Date, default: null },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		assignedAt: { type: Date, default: null },
		assignmentStatus: {
			type: String,
			enum: ["Assigned", "InProgress", "Completed", "Rejected", "Cancelled"],
		},
		employeeNotes: { type: String, default: "" },
		assignmentHistory: [assignmentHistorySchema],
	},
	{ timestamps: true }
);

const ContactQuery = mongoose.model("ContactQuery", contactQuerySchema);
module.exports = ContactQuery;
