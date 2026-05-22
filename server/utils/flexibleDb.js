const mongoose = require("mongoose");

function buildIdInQuery(ids) {
	const raw = [...new Set((ids || []).map((id) => String(id || "").trim()).filter(Boolean))];
	if (raw.length === 0) return null;

	const objectIds = raw
		.filter((id) => mongoose.isValidObjectId(id))
		.map((id) => new mongoose.Types.ObjectId(id));

	return {
		$or: [{ _id: { $in: raw } }, ...(objectIds.length ? [{ _id: { $in: objectIds } }] : [])],
	};
}

function buildForeignKeyQuery(field, id) {
	const raw = String(id || "").trim();
	if (!raw) return null;

	const variants = [raw];
	if (mongoose.isValidObjectId(raw)) {
		variants.push(new mongoose.Types.ObjectId(raw));
	}

	return { $or: variants.map((value) => ({ [field]: value })) };
}

async function findByIds(collection, ids, projection) {
	const query = buildIdInQuery(ids);
	if (!query) return [];
	const options = projection ? { projection } : {};
	return collection.find(query, options).toArray();
}

async function findByForeignKey(collection, field, id, sort = null) {
	const query = buildForeignKeyQuery(field, id);
	if (!query) return [];
	let cursor = collection.find(query);
	if (sort) cursor = cursor.sort(sort);
	return cursor.toArray();
}

async function findByForeignKeys(collection, field, ids, sort = null) {
	const raw = [...new Set((ids || []).map((id) => String(id || "").trim()).filter(Boolean))];
	if (raw.length === 0) return [];

	const objectIds = raw
		.filter((id) => mongoose.isValidObjectId(id))
		.map((id) => new mongoose.Types.ObjectId(id));

	const query = {
		$or: [{ [field]: { $in: raw } }, ...(objectIds.length ? [{ [field]: { $in: objectIds } }] : [])],
	};

	let cursor = collection.find(query);
	if (sort) cursor = cursor.sort(sort);
	return cursor.toArray();
}

module.exports = {
	buildIdInQuery,
	buildForeignKeyQuery,
	findByIds,
	findByForeignKey,
	findByForeignKeys,
};
