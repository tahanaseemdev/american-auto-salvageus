const mongoose = require("mongoose");

const appSettingsSchema = new mongoose.Schema(
	{
		key: { type: String, required: true, unique: true },
		lastAssignedEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		assignmentCounter: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

const AppSettings = mongoose.model("AppSettings", appSettingsSchema);
module.exports = AppSettings;
