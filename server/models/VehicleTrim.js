const mongoose = require("mongoose");

const vehicleTrimSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		year: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleYear", required: true },
	},
	{ timestamps: true }
);

const VehicleTrim = mongoose.models.VehicleTrim || mongoose.model("VehicleTrim", vehicleTrimSchema);

const dropLegacyTrimIndexes = async () => {
	try {
		await VehicleTrim.collection.dropIndex("year_1_title_1");
	} catch (err) {
		if (err?.codeName !== "IndexNotFound") {
			console.warn("Unable to drop legacy VehicleTrim year_1_title_1 index:", err.message);
		}
	}
};

if (mongoose.connection.readyState === 1) {
	dropLegacyTrimIndexes();
} else {
	mongoose.connection.once("open", dropLegacyTrimIndexes);
}

module.exports = VehicleTrim;
