const mongoose = require("mongoose");
const VehiclePart = require("../models/VehiclePart");
const VehicleMake = require("../models/VehicleMake");
const VehicleModel = require("../models/VehicleModel");
const VehicleYear = require("../models/VehicleYear");
const VehicleTrim = require("../models/VehicleTrim");
const { sendJsonResponse } = require("../utils/helpers");

const isValidId = (value) => mongoose.isValidObjectId(value);

const getIdString = (value) => {
	if (!value) return "";
	if (typeof value === "object" && value._id) return String(value._id);
	return String(value);
};

async function fetchLiveTrimsBySelection({ partTitle, makeName, modelTitle, yearTitle }) {
	if (!partTitle || !makeName || !modelTitle || !yearTitle) return [];

	const url = new URL("https://allusedautoparts.world/api/ymm_options.php");
	url.searchParams.set("level", "trim");
	url.searchParams.set("part", partTitle);
	url.searchParams.set("make", makeName);
	url.searchParams.set("model", modelTitle);
	url.searchParams.set("year", yearTitle);

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 8000);
		const response = await fetch(url.toString(), {
			headers: { Accept: "application/json" },
			signal: controller.signal,
		});
		clearTimeout(timeoutId);

		if (!response.ok) return [];
		const payload = await response.json();
		if (!Array.isArray(payload?.values)) return [];
		return payload.values
			.map((value) => String(value || "").trim())
			.filter(Boolean)
			.map((title, index) => ({
				_id: `${partTitle}-${makeName}-${modelTitle}-${yearTitle}-${index}`.toLowerCase().replace(/\s+/g, "-"),
				title,
				year: null,
			}));
	} catch {
		return [];
	}
}

function buildSyntheticProducts({ category, selectedMake, selectedModel, selectedYear, selectedTrim, models = [], years = [], trims = [] }) {
	const baseImage = category?.image || "";
	const partName = category?.title || "Part";
	const makeName = selectedMake?.name || "";
	const modelName = selectedModel?.title || "";
	const yearName = selectedYear?.title || "";

	const buildName = ({ yearTitle = "", trimTitle = "" }) => {
		return [yearTitle, makeName, modelName, partName, trimTitle].filter(Boolean).join(" ");
	};

	if (selectedTrim) {
		const productId = `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${getIdString(selectedModel?._id)}-${getIdString(selectedYear?._id)}-${getIdString(selectedTrim?._id)}`;
		return [{
			_id: productId,
			name: buildName({ yearTitle: yearName, trimTitle: selectedTrim.title }),
			image: baseImage,
			price: 0,
			category,
			subCategory: selectedMake,
			model: selectedModel,
			year: selectedYear,
			trim: selectedTrim,
			synthetic: true,
		}];
	}

	if (selectedYear) {
		if (trims.length > 0) {
			return trims.map((trimItem) => ({
				_id: `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${getIdString(selectedModel?._id)}-${getIdString(selectedYear?._id)}-${getIdString(trimItem?._id)}`,
				name: buildName({ yearTitle: yearName, trimTitle: trimItem.title }),
				image: baseImage,
				price: 0,
				category,
				subCategory: selectedMake,
				model: selectedModel,
				year: selectedYear,
				trim: trimItem,
				synthetic: true,
			}));
		}

		return [{
			_id: `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${getIdString(selectedModel?._id)}-${getIdString(selectedYear?._id)}`,
			name: buildName({ yearTitle: yearName }),
			image: baseImage,
			price: 0,
			category,
			subCategory: selectedMake,
			model: selectedModel,
			year: selectedYear,
			trim: null,
			synthetic: true,
		}];
	}

	if (selectedModel) {
		return years.slice(0, 60).map((yearItem) => ({
			_id: `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${getIdString(selectedModel?._id)}-${getIdString(yearItem?._id)}`,
			name: buildName({ yearTitle: yearItem.title }),
			image: baseImage,
			price: 0,
			category,
			subCategory: selectedMake,
			model: selectedModel,
			year: yearItem,
			trim: null,
			synthetic: true,
		}));
	}

	if (selectedMake) {
		return models.slice(0, 60).map((modelItem) => ({
			_id: `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${getIdString(modelItem?._id)}`,
			name: [selectedMake.name, modelItem.title, partName].filter(Boolean).join(" "),
			image: baseImage,
			price: 0,
			category,
			subCategory: selectedMake,
			model: modelItem,
			year: null,
			trim: null,
			synthetic: true,
		}));
	}

	return [];
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
		const dbTrims = selectedYearId ? await VehicleTrim.find({ year: selectedYearId }).lean() : [];

		const selectedMake = selectedMakeId ? makes.find((entry) => getIdString(entry._id) === selectedMakeId) || null : null;
		const selectedModel = selectedModelId ? models.find((entry) => getIdString(entry._id) === selectedModelId) || null : null;
		const selectedYear = selectedYearId ? years.find((entry) => getIdString(entry._id) === selectedYearId) || null : null;

		let trims = dbTrims;
		if (selectedMake && selectedModel && selectedYear) {
			const liveTrims = await fetchLiveTrimsBySelection({
				partTitle: category.title,
				makeName: selectedMake.name,
				modelTitle: selectedModel.title,
				yearTitle: selectedYear.title,
			});
			if (liveTrims.length > 0) {
				trims = liveTrims;
			}
		}

		const selectedTrim = trim ? trims.find((entry) => getIdString(entry._id) === trim) || null : null;
		const syntheticProducts = buildSyntheticProducts({
			category,
			selectedMake,
			selectedModel,
			selectedYear,
			selectedTrim,
			models,
			years,
			trims,
		});

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Part detail fetched.", {
			part: category,
			category,
			subCategories: makes,
			makes,
			models,
			years,
			trims,
			products: syntheticProducts,
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
