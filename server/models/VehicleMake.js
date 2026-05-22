const mongoose = require("mongoose");

const vehicleMakeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		part: { type: mongoose.Schema.Types.ObjectId, ref: "VehiclePart", default: null },
		image: { type: String, default: "" },
	},
	{ timestamps: true, collection: "subcategories" }
);

const VehicleMake = mongoose.models.VehicleMake || mongoose.model("VehicleMake", vehicleMakeSchema);
module.exports = VehicleMake;
