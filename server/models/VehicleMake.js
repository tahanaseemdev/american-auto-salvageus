const mongoose = require("mongoose");

const vehicleMakeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		image: { type: String, default: "" },
		category: { type: mongoose.Schema.Types.ObjectId, ref: "VehiclePart", required: true },
	},
	{ timestamps: true, collection: "subcategories" }
);

const VehicleMake = mongoose.models.VehicleMake || mongoose.model("VehicleMake", vehicleMakeSchema);
module.exports = VehicleMake;
