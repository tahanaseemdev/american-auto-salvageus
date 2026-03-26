const mongoose = require("mongoose");

const vehicleModelSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, unique: true, trim: true },
	},
	{ timestamps: true }
);

const VehicleModel = mongoose.model("VehicleModel", vehicleModelSchema);
module.exports = VehicleModel;
