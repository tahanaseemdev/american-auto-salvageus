const mongoose = require("mongoose");
const VehiclePart = require("../models/VehiclePart");
const VehicleMake = require("../models/VehicleMake");
const VehicleModel = require("../models/VehicleModel");
const VehicleYear = require("../models/VehicleYear");
const VehicleTrim = require("../models/VehicleTrim");
const Product = require("../models/Product");
const { sendJsonResponse } = require("../utils/helpers");

const isValidId = (value) => mongoose.isValidObjectId(value);

const getIdString = (value) => {
	if (!value) return "";
	if (typeof value === "object" && value._id) return String(value._id);
	return String(value);
};

const toTitleObject = (value) => {
	if (!value) return null;
	if (typeof value === "object" && (value.title || value._id)) return value;
	return { _id: null, title: String(value) };
};

async function hydrateVehicleRefs(products) {
	if (!Array.isArray(products) || products.length === 0) return products;

	const modelIds = [...new Set(products.map((item) => getIdString(item.model)).filter((id) => isValidId(id)))];
	const yearIds = [...new Set(products.map((item) => getIdString(item.year)).filter((id) => isValidId(id)))];
	const trimIds = [...new Set(products.map((item) => getIdString(item.trim)).filter((id) => isValidId(id)))];

	const [models, years, trims] = await Promise.all([
		modelIds.length ? VehicleModel.find({ _id: { $in: modelIds } }).select("title").lean() : [],
		yearIds.length ? VehicleYear.find({ _id: { $in: yearIds } }).select("title").lean() : [],
		trimIds.length ? VehicleTrim.find({ _id: { $in: trimIds } }).select("title").lean() : [],
	]);

	const modelMap = new Map(models.map((item) => [String(item._id), item]));
	const yearMap = new Map(years.map((item) => [String(item._id), item]));
	const trimMap = new Map(trims.map((item) => [String(item._id), item]));

	return products.map((item) => {
		const modelId = getIdString(item.model);
		const yearId = getIdString(item.year);
		const trimId = getIdString(item.trim);

		return {
			...item,
			model: modelMap.get(modelId) || toTitleObject(item.model),
			year: yearMap.get(yearId) || toTitleObject(item.year),
			trim: trimMap.get(trimId) || toTitleObject(item.trim),
		};
	});
}

async function getAllCategories(req, res, next) {
	try {
		const { featured } = req.query;
		const filter = {};
		if (featured !== undefined) filter.featured = String(featured).toLowerCase() === "true";
		const categories = await VehiclePart.find(filter).sort({ createdAt: -1 }).lean();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Parts fetched.", categories);
	} catch (err) {
		next(err);
	}
}

/**
 * Returns a Part with nested Make/Model/Year/Trim options and products.
 * GET /v1/categories/:id
 */
async function getCategoryDetail(req, res, next) {
	try {
		const { id } = req.params;
		const { make, model, year, trim } = req.query;

		if (make && !isValidId(make)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid make id.");
		}
		if (model && !isValidId(model)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid model id.");
		}
		if (year && !isValidId(year)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid year id.");
		}
		if (trim && !isValidId(trim)) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid trim id.");
		}

		const [category, makes] = await Promise.all([
			VehiclePart.findById(id).lean(),
			VehicleMake.find().lean(),
		]);

		if (!category) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Part not found.");
		}

		const selectedMakeId = make || null;
		const models = selectedMakeId ? await VehicleModel.find({ make: selectedMakeId }).lean() : [];

		const selectedModelId = model || null;
		const years = selectedModelId ? await VehicleYear.find({ model: selectedModelId }).lean() : [];

		const selectedYearId = year || null;
		const trims = selectedYearId ? await VehicleTrim.find({ year: selectedYearId }).lean() : [];

		const productFilter = { category: id };
		if (selectedMakeId) productFilter.subCategory = selectedMakeId;
		if (selectedModelId) productFilter.model = selectedModelId;
		if (selectedYearId) productFilter.year = selectedYearId;
		if (trim) productFilter.trim = trim;

		const products = await Product.find(productFilter)
			.populate("category", "title")
			.populate("subCategory", "name")
			.lean();

		const hydratedProducts = await hydrateVehicleRefs(products);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Part detail fetched.", {
			part: category,
			category,
			subCategories: makes,
			makes,
			models,
			years,
			trims,
			products: hydratedProducts,
		});
	} catch (err) {
		next(err);
	}
}

// ── Admin CRUD ────────────────────────────────────────────────────────────────

async function adminGetAll(req, res, next) {
	try {
		const { featured } = req.query;
		const filter = {};
		if (featured !== undefined) filter.featured = String(featured).toLowerCase() === "true";
		const categories = await VehiclePart.find(filter).sort({ createdAt: -1 }).lean();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Parts fetched.", categories);
	} catch (err) {
		next(err);
	}
}

async function createCategory(req, res, next) {
	try {
		const { title, image, featured } = req.body;
		if (!title) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "title is required.");
		}
		const category = await VehiclePart.create({ title, image, featured: Boolean(featured) });
		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Part created.", category);
	} catch (err) {
		next(err);
	}
}

async function updateCategory(req, res, next) {
	try {
		const { id } = req.params;
		const updates = req.body;
		const category = await VehiclePart.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
		if (!category) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Part not found.");
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Part updated.", category);
	} catch (err) {
		next(err);
	}
}

async function deleteCategory(req, res, next) {
	try {
		const { id } = req.params;
		await VehiclePart.findByIdAndDelete(id);
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Part deleted.");
	} catch (err) {
		next(err);
	}
}

// ── Admin Make CRUD ──────────────────────────────────────────────────────────

async function createSubCategory(req, res, next) {
	try {
		const { name } = req.body;
		if (!name) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "name is required.");
		}
		const sub = await VehicleMake.create({ name });
		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Make created.", sub);
	} catch (err) {
		next(err);
	}
}

async function getSubCategories(req, res, next) {
	try {
		const subs = await VehicleMake.find().lean();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Makes fetched.", subs);
	} catch (err) {
		next(err);
	}
}

async function updateSubCategory(req, res, next) {
	try {
		const payload = { name: String(req.body?.name || "").trim() };
		if (!payload.name) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "name is required.");
		}

		const sub = await VehicleMake.findByIdAndUpdate(req.params.id, payload, { new: true });
		if (!sub) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Make not found.");
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Make updated.", sub);
	} catch (err) {
		next(err);
	}
}

async function deleteSubCategory(req, res, next) {
	try {
		await VehicleMake.findByIdAndDelete(req.params.id);
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Make deleted.");
	} catch (err) {
		next(err);
	}
}

module.exports = {
	getAllCategories,
	getCategoryDetail,
	adminGetAll,
	createCategory,
	updateCategory,
	deleteCategory,
	createSubCategory,
	getSubCategories,
	updateSubCategory,
	deleteSubCategory,
};
