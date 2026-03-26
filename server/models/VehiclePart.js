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

// Legacy deployments may still have an old unique slug index from previous schema versions.
// Drop it so duplicate Part titles and null slug values are allowed.
const dropLegacyPartIndexes = async () => {
	try {
		await VehiclePart.collection.dropIndex("slug_1");
	} catch (err) {
		if (err?.codeName !== "IndexNotFound") {
			console.warn("Unable to drop legacy categories.slug_1 index:", err.message);
		}
	}
};

if (mongoose.connection.readyState === 1) {
	dropLegacyPartIndexes();
} else {
	mongoose.connection.once("open", dropLegacyPartIndexes);
}

module.exports = VehiclePart;
