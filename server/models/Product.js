const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		model: { type: String, trim: true, default: "" },
		year: { type: String, trim: true, default: "" },
		trim: { type: String, trim: true, default: "" },
		featured: { type: Boolean, default: false },
		image: { type: String, default: "" },
		price: { type: Number, required: true, min: 0 },
		category: { type: mongoose.Schema.Types.ObjectId, ref: "VehiclePart", required: true },
		subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleMake", default: null },
	},
	{ timestamps: true }
);

productSchema.index({ name: "text", model: "text", year: "text", trim: "text" });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
