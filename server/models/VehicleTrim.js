const mongoose = require("mongoose");

const mileageBandSchema = new mongoose.Schema(
	{
		key: { type: String, default: "" },
		label: { type: String, default: "" },
		mileage: { type: String, default: "" },
		price: { type: String, default: "" },
		amount: { type: Number, default: 0 },
		selected: { type: Boolean, default: false },
	},
	{ _id: false }
);

const vehicleTrimSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		year: { type: mongoose.Schema.Types.Mixed, required: true },
		make: { type: mongoose.Schema.Types.Mixed, default: null },
		part: { type: mongoose.Schema.Types.Mixed, default: null },
		price: { type: String, default: "" },
		mileageBands: { type: [mileageBandSchema], default: [] },
		productId: { type: mongoose.Schema.Types.Mixed, default: null },
		productUrl: { type: String, default: "" },
		priceSource: { type: String, default: "" },
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
