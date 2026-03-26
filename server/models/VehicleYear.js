const mongoose = require("mongoose");

const vehicleYearSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		model: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleModel", required: true },
	},
	{ timestamps: true }
);

const VehicleYear = mongoose.models.VehicleYear || mongoose.model("VehicleYear", vehicleYearSchema);

const dropLegacyYearIndexes = async () => {
	try {
		await VehicleYear.collection.dropIndex("model_1_title_1");
	} catch (err) {
		if (err?.codeName !== "IndexNotFound") {
			console.warn("Unable to drop legacy VehicleYear model_1_title_1 index:", err.message);
		}
	}
};

if (mongoose.connection.readyState === 1) {
	dropLegacyYearIndexes();
} else {
	mongoose.connection.once("open", dropLegacyYearIndexes);
}

module.exports = VehicleYear;
