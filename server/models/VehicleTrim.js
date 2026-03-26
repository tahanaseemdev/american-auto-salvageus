const mongoose = require("mongoose");

const vehicleTrimSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, unique: true, trim: true },
	},
	{ timestamps: true }
);

const VehicleTrim = mongoose.model("VehicleTrim", vehicleTrimSchema);
module.exports = VehicleTrim;
