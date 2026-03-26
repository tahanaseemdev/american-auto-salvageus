const mongoose = require("mongoose");

const vehiclePartSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		featured: { type: Boolean, default: false },
		image: { type: String, default: "" },
	},
	{ timestamps: true, collection: "categories" }
);

const VehiclePart = mongoose.models.VehiclePart || mongoose.model("VehiclePart", vehiclePartSchema);
module.exports = VehiclePart;
