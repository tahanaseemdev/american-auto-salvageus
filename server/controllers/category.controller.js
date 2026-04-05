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

function shouldFetchLiveTrims(partTitle) {
	const key = String(partTitle || "").trim().toLowerCase();
	return key === "engine" || key === "transmission";
}

async function findByIdFlexible(EntityModel, id) {
	const rawId = String(id || "").trim();
	if (!rawId) return null;

	const variants = [rawId];
	if (mongoose.isValidObjectId(rawId)) {
		variants.push(new mongoose.Types.ObjectId(rawId));
	}

	return EntityModel.collection.findOne({ _id: { $in: variants } });
}

async function findByForeignFlexible(EntityModel, field, id, sort = { title: 1 }) {
	const rawId = String(id || "").trim();
	if (!rawId) return [];

	const variants = [rawId];
	if (mongoose.isValidObjectId(rawId)) {
		variants.push(new mongoose.Types.ObjectId(rawId));
	}

	const query = { $or: variants.map((value) => ({ [field]: value })) };
	let cursor = EntityModel.collection.find(query);
	if (sort && typeof sort === "object") {
		cursor = cursor.sort(sort);
	}
	return cursor.toArray();
}

async function findByForeignManyFlexible(EntityModel, field, ids, sort = { title: 1 }) {
	const rawIds = [...new Set((ids || []).map((id) => String(id || "").trim()).filter(Boolean))];
	if (rawIds.length === 0) return [];

	const objectIds = rawIds.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
	const query = {
		$or: [{ [field]: { $in: rawIds } }, ...(objectIds.length ? [{ [field]: { $in: objectIds } }] : [])],
	};

	let cursor = EntityModel.collection.find(query);
	if (sort && typeof sort === "object") {
		cursor = cursor.sort(sort);
	}
	return cursor.toArray();
}

function buildIdVariants(id) {
	const rawId = String(id || "").trim();
	if (!rawId) return [];

	const variants = [rawId];
	if (mongoose.isValidObjectId(rawId)) {
		variants.push(new mongoose.Types.ObjectId(rawId));
	}

	return variants;
}

async function findTrimsByHierarchy({ yearIds = [], partId = null, makeId = null, sort = { title: 1 } }) {
	const rawYearIds = [...new Set((yearIds || []).map((id) => String(id || "").trim()).filter(Boolean))];
	if (rawYearIds.length === 0) return [];

	const yearObjectIds = rawYearIds.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
	const query = {
		$and: [
			{
				$or: [{ year: { $in: rawYearIds } }, ...(yearObjectIds.length ? [{ year: { $in: yearObjectIds } }] : [])],
			},
		],
	};

	const partVariants = buildIdVariants(partId);
	if (partVariants.length) {
		query.$and.push({ $or: partVariants.map((value) => ({ part: value })) });
	}

	const makeVariants = buildIdVariants(makeId);
	if (makeVariants.length) {
		query.$and.push({ $or: makeVariants.map((value) => ({ make: value })) });
	}

	let cursor = VehicleTrim.collection.find(query);
	if (sort && typeof sort === "object") {
		cursor = cursor.sort(sort);
	}

	return cursor.toArray();
}

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

function buildSyntheticProducts({
	category,
	allMakes = [],
	selectedMake,
	selectedModel,
	selectedYear,
	selectedTrim,
	allModels = [],
	models = [],
	years = [],
	trims = [],
	allYears = [],
	allTrims = [],
}) {
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
		const trimsByYear = new Map();
		for (const trimItem of allTrims) {
			const key = getIdString(trimItem?.year);
			if (!key) continue;
			if (!trimsByYear.has(key)) trimsByYear.set(key, []);
			trimsByYear.get(key).push(trimItem);
		}

		const expanded = [];
		for (const yearItem of years) {
			const yearId = getIdString(yearItem?._id);
			const yearTrims = trimsByYear.get(yearId) || [];

			if (yearTrims.length === 0) {
				expanded.push({
					_id: `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${getIdString(selectedModel?._id)}-${yearId}`,
					name: buildName({ yearTitle: yearItem.title }),
					image: baseImage,
					price: 0,
					category,
					subCategory: selectedMake,
					model: selectedModel,
					year: yearItem,
					trim: null,
					synthetic: true,
				});
				continue;
			}

			for (const trimItem of yearTrims) {
				expanded.push({
					_id: `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${getIdString(selectedModel?._id)}-${yearId}-${getIdString(trimItem?._id)}`,
					name: buildName({ yearTitle: yearItem.title, trimTitle: trimItem.title }),
					image: baseImage,
					price: 0,
					category,
					subCategory: selectedMake,
					model: selectedModel,
					year: yearItem,
					trim: trimItem,
					synthetic: true,
				});
			}
		}

		return expanded;
	}

	if (selectedMake) {
		const yearsByModel = new Map();
		for (const yearItem of allYears) {
			const key = getIdString(yearItem?.model);
			if (!key) continue;
			if (!yearsByModel.has(key)) yearsByModel.set(key, []);
			yearsByModel.get(key).push(yearItem);
		}

		const trimsByYear = new Map();
		for (const trimItem of allTrims) {
			const key = getIdString(trimItem?.year);
			if (!key) continue;
			if (!trimsByYear.has(key)) trimsByYear.set(key, []);
			trimsByYear.get(key).push(trimItem);
		}

		const expanded = [];
		for (const modelItem of models) {
			const modelId = getIdString(modelItem?._id);
			const modelYears = yearsByModel.get(modelId) || [];

			if (modelYears.length === 0) {
				expanded.push({
					_id: `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${modelId}`,
					name: [selectedMake.name, modelItem.title, partName].filter(Boolean).join(" "),
					image: baseImage,
					price: 0,
					category,
					subCategory: selectedMake,
					model: modelItem,
					year: null,
					trim: null,
					synthetic: true,
				});
				continue;
			}

			for (const yearItem of modelYears) {
				const yearId = getIdString(yearItem?._id);
				const yearTrims = trimsByYear.get(yearId) || [];

				if (yearTrims.length === 0) {
					expanded.push({
						_id: `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${modelId}-${yearId}`,
						name: [yearItem.title, selectedMake.name, modelItem.title, partName].filter(Boolean).join(" "),
						image: baseImage,
						price: 0,
						category,
						subCategory: selectedMake,
						model: modelItem,
						year: yearItem,
						trim: null,
						synthetic: true,
					});
					continue;
				}

				for (const trimItem of yearTrims) {
					expanded.push({
						_id: `${getIdString(category?._id)}-${getIdString(selectedMake?._id)}-${modelId}-${yearId}-${getIdString(trimItem?._id)}`,
						name: [yearItem.title, selectedMake.name, modelItem.title, partName, trimItem.title].filter(Boolean).join(" "),
						image: baseImage,
						price: 0,
						category,
						subCategory: selectedMake,
						model: modelItem,
						year: yearItem,
						trim: trimItem,
						synthetic: true,
					});
				}
			}
		}

		return expanded;
	}

	if (allMakes.length > 0) {
		const yearsByModel = new Map();
		for (const yearItem of allYears) {
			const key = getIdString(yearItem?.model);
			if (!key) continue;
			if (!yearsByModel.has(key)) yearsByModel.set(key, []);
			yearsByModel.get(key).push(yearItem);
		}

		const trimsByYear = new Map();
		for (const trimItem of allTrims) {
			const key = getIdString(trimItem?.year);
			if (!key) continue;
			if (!trimsByYear.has(key)) trimsByYear.set(key, []);
			trimsByYear.get(key).push(trimItem);
		}

		const modelsByMake = new Map();
		for (const modelItem of allModels) {
			const key = getIdString(modelItem?.make);
			if (!key) continue;
			if (!modelsByMake.has(key)) modelsByMake.set(key, []);
			modelsByMake.get(key).push(modelItem);
		}

		const expanded = [];
		for (const makeItem of allMakes) {
			const makeId = getIdString(makeItem?._id);
			const makeModels = modelsByMake.get(makeId) || [];

			for (const modelItem of makeModels) {
				const modelId = getIdString(modelItem?._id);
				const modelYears = yearsByModel.get(modelId) || [];

				if (modelYears.length === 0) {
					expanded.push({
						_id: `${getIdString(category?._id)}-${makeId}-${modelId}`,
						name: [makeItem.name, modelItem.title, partName].filter(Boolean).join(" "),
						image: baseImage,
						price: 0,
						category,
						subCategory: makeItem,
						model: modelItem,
						year: null,
						trim: null,
						synthetic: true,
					});
					continue;
				}

				for (const yearItem of modelYears) {
					const yearId = getIdString(yearItem?._id);
					const yearTrims = trimsByYear.get(yearId) || [];

					if (yearTrims.length === 0) {
						expanded.push({
							_id: `${getIdString(category?._id)}-${makeId}-${modelId}-${yearId}`,
							name: [yearItem.title, makeItem.name, modelItem.title, partName].filter(Boolean).join(" "),
							image: baseImage,
							price: 0,
							category,
							subCategory: makeItem,
							model: modelItem,
							year: yearItem,
							trim: null,
							synthetic: true,
						});
						continue;
					}

					for (const trimItem of yearTrims) {
						expanded.push({
							_id: `${getIdString(category?._id)}-${makeId}-${modelId}-${yearId}-${getIdString(trimItem?._id)}`,
							name: [yearItem.title, makeItem.name, modelItem.title, partName, trimItem.title].filter(Boolean).join(" "),
							image: baseImage,
							price: 0,
							category,
							subCategory: makeItem,
							model: modelItem,
							year: yearItem,
							trim: trimItem,
							synthetic: true,
						});
					}
				}
			}
		}

		return expanded;
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
			findByIdFlexible(VehiclePart, id),
			VehicleMake.find().lean(),
		]);

		if (!category) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Part not found.");
		}

		const selectedMakeId = make || null;
		const models = selectedMakeId ? await findByForeignFlexible(VehicleModel, "make", selectedMakeId) : [];
		const allModels = selectedMakeId ? [] : await VehicleModel.find().lean();

		const selectedModelId = model || null;
		const years = selectedModelId ? await findByForeignFlexible(VehicleYear, "model", selectedModelId) : [];
		const allYears = selectedMakeId
			? selectedModelId
				? years
				: await findByForeignManyFlexible(
					VehicleYear,
					"model",
					models.map((item) => getIdString(item?._id))
				)
			: selectedModelId
				? years
				: await findByForeignManyFlexible(
					VehicleYear,
					"model",
					allModels.map((item) => getIdString(item?._id))
				);

		const selectedYearId = year || null;
		const trimYearIds = (selectedYearId ? [selectedYearId] : (selectedModelId ? years : allYears).map((item) => getIdString(item?._id)))
			.filter(Boolean);
		const trimsByHierarchy = trimYearIds.length
			? await findTrimsByHierarchy({
				yearIds: trimYearIds,
				partId: getIdString(category?._id),
				makeId: selectedMakeId,
			})
			: [];
		const dbTrims = selectedYearId
			? trimsByHierarchy.filter((item) => getIdString(item?.year) === selectedYearId)
			: [];
		const allTrims = selectedYearId
			? dbTrims
			: trimsByHierarchy;

		const selectedMake = selectedMakeId ? makes.find((entry) => getIdString(entry._id) === selectedMakeId) || null : null;
		const selectedModel = selectedModelId ? models.find((entry) => getIdString(entry._id) === selectedModelId) || null : null;
		const selectedYear = selectedYearId ? years.find((entry) => getIdString(entry._id) === selectedYearId) || null : null;

		const trims = dbTrims;

		const selectedTrim = trim ? trims.find((entry) => getIdString(entry._id) === trim) || null : null;
		const syntheticProducts = buildSyntheticProducts({
			category,
			allMakes: makes,
			selectedMake,
			selectedModel,
			selectedYear,
			selectedTrim,
			allModels,
			models,
			years,
			trims,
			allYears,
			allTrims,
		});

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Part detail fetched.", {
			part: category,
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
