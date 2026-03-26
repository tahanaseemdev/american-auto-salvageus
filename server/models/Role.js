const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true, trim: true },
});

const roleSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, unique: true, trim: true },
		permissions: [{ type: String, trim: true }],
	},
	{ timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
