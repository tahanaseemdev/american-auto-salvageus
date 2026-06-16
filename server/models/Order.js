const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
	{
		product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
		name: { type: String, required: true },
		price: { type: Number, required: true },
		quantity: { type: Number, required: true, min: 1 },
	},
	{ _id: false }
);

const shippingSchema = new mongoose.Schema(
	{
		firstName: String,
		lastName: String,
		email: String,
		phone: String,
		address: String,
		city: String,
		state: String,
		zip: String,
		notes: String,
	},
	{ _id: false }
);

const assignmentHistorySchema = new mongoose.Schema(
	{
		from: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		action: { type: String, required: true },
		note: { type: String, default: "" },
		at: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const orderSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		orderNumber: { type: String, unique: true },
		products: [orderItemSchema],
		subtotal: { type: Number, required: true },
		shipping: { type: Number, default: 0 },
		totalAmount: { type: Number, required: true },
		status: {
			type: String,
			enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
			default: "Pending",
		},
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		assignedAt: { type: Date, default: null },
		assignmentStatus: {
			type: String,
			enum: ["Assigned", "InProgress", "Completed", "Rejected", "Cancelled"],
		},
		employeeNotes: { type: String, default: "" },
		assignmentHistory: [assignmentHistorySchema],
		shippingDetails: shippingSchema,
		paymentMethod: { type: String, default: "card" },
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
