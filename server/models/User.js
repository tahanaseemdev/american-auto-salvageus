const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const cartItemSchema = new mongoose.Schema(
	{
		product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
		quantity: { type: Number, required: true, min: 1, default: 1 },
	},
	{ _id: false }
);

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, minlength: 8 },
		phone: { type: String, trim: true, default: "" },
		role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
		isRevoked: { type: Boolean, default: false },
		resetPasswordTokenHash: { type: String, default: null },
		resetPasswordExpiresAt: { type: Date, default: null },
		cart: [cartItemSchema],
	},
	{ timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.methods.comparePassword = function (plain) {
	return bcrypt.compare(plain, this.password);
};

// Never expose sensitive fields in JSON responses
userSchema.set("toJSON", {
	transform(_doc, ret) {
		delete ret.password;
		delete ret.__v;
		return ret;
	},
});

const User = mongoose.model("User", userSchema);
module.exports = User;
