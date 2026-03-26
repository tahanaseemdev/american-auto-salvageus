const mongoose = require("mongoose");

const vehicleModelSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		make: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleMake", required: true },
	},
	{ timestamps: true }
);

const VehicleModel = mongoose.models.VehicleModel || mongoose.model("VehicleModel", vehicleModelSchema);

const dropLegacyModelIndexes = async () => {
	try {
		await VehicleModel.collection.dropIndex("make_1_title_1");
	} catch (err) {
		if (err?.codeName !== "IndexNotFound") {
			console.warn("Unable to drop legacy VehicleModel make_1_title_1 index:", err.message);
		}
	}
};

if (mongoose.connection.readyState === 1) {
	dropLegacyModelIndexes();
} else {
	mongoose.connection.once("open", dropLegacyModelIndexes);
}

module.exports = VehicleModel;
