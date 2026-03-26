const mongoose = require("mongoose");

const vehicleYearSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, unique: true, trim: true },
	},
	{ timestamps: true }
);

const VehicleYear = mongoose.model("VehicleYear", vehicleYearSchema);
module.exports = VehicleYear;
