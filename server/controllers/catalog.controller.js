const mongoose = require("mongoose");
const VehicleModel = require("../models/VehicleModel");
const VehicleYear = require("../models/VehicleYear");
const VehicleTrim = require("../models/VehicleTrim");
const VehiclePart = require("../models/VehiclePart");
const VehicleMake = require("../models/VehicleMake");
const { sendJsonResponse } = require("../utils/helpers");

function normalizeObjectIdValue(value) {
	if (value === undefined || value === null || value === "") return null;

	let normalized = value;
	if (typeof normalized === "object") {
		normalized = normalized?._id ?? null;
	}

	normalized = String(normalized || "").trim();
	if (!normalized || normalized === "[object Object]") return null;
	if (!mongoose.isValidObjectId(normalized)) return false;
	return normalized;
}

function buildFlexibleIdFilter(field, id) {
	const rawId = String(id || "").trim();
	if (!rawId) return {};

	const variants = [rawId];
	if (mongoose.isValidObjectId(rawId)) {
		variants.push(new mongoose.Types.ObjectId(rawId));
	}

	return { $or: variants.map((value) => ({ [field]: value })) };
}

function buildFlexibleFieldMatch(field, id) {
	const rawId = String(id || "").trim();
	if (!rawId) return null;

	const variants = [rawId];
	if (mongoose.isValidObjectId(rawId)) {
		variants.push(new mongoose.Types.ObjectId(rawId));
	}

	return { $or: variants.map((value) => ({ [field]: value })) };
}

function shouldFetchLiveTrims(partTitle) {
	const key = String(partTitle || "").trim().toLowerCase();
	return key === "engine" || key === "transmission";
}

async function hydrateForeignField(items, { field, model, select }) {
	if (!Array.isArray(items) || items.length === 0 || !field || !model) return items;

	const candidateIds = [];
	for (const item of items) {
		const raw = item?.[field];
		if (!raw) continue;

		if (typeof raw === "object" && raw._id) {
			candidateIds.push(String(raw._id));
			continue;
		}

		candidateIds.push(String(raw));
	}

	const uniqueIds = [...new Set(candidateIds.map((id) => String(id || "").trim()).filter(Boolean))];
	if (uniqueIds.length === 0) {
		return items.map((item) => ({ ...item, [field]: null }));
	}

	const uniqueObjectIds = uniqueIds
		.filter((id) => mongoose.isValidObjectId(id))
		.map((id) => new mongoose.Types.ObjectId(id));

	const lookupQuery = {
		$or: [{ _id: { $in: uniqueIds } }, ...(uniqueObjectIds.length ? [{ _id: { $in: uniqueObjectIds } }] : [])],
	};

	const projection = (() => {
		const fields = String(select || "")
			.split(/\s+/)
			.map((f) => f.trim())
			.filter(Boolean)
			.filter((f) => !f.startsWith("-"));
		if (fields.length === 0) return undefined;
		const p = { _id: 1 };
		for (const f of fields) p[f] = 1;
		return p;
	})();

	const docs = await model.collection.find(lookupQuery, { projection }).toArray();
	const docMap = new Map(docs.map((doc) => [String(doc._id), doc]));

	return items.map((item) => {
		const raw = item?.[field];
		const rawId = typeof raw === "object" && raw?._id ? String(raw._id) : String(raw || "");
		return {
			...item,
			[field]: docMap.get(rawId) || null,
		};
	});
}

function buildCrudHandlers(EntityModel, options) {
	const { label, parentField, parentLabel, filterQueryKeys = [], populate = [], foreignModel = null, foreignSelect = "" } = options;
	const plural = `${label}s`;

	const buildFilter = (query) => {
		const filter = {};
		for (const key of filterQueryKeys) {
			if (query?.[key]) {
				const normalized = normalizeObjectIdValue(query[key]);
				if (normalized === false) {
					return { filter: null, invalidKey: key };
				}
				if (normalized) {
					Object.assign(filter, buildFlexibleIdFilter(parentField, normalized));
				}
				break;
			}
		}
		return { filter, invalidKey: null };
	};

	const buildFindWithPopulate = async (filter, sort) => {
		if (foreignModel) {
			const rows = await EntityModel.find(filter).sort(sort).lean();
			return hydrateForeignField(rows, { field: parentField, model: foreignModel, select: foreignSelect });
		}

		let query = EntityModel.find(filter).sort(sort);
		for (const pop of populate) {
			query = query.populate(pop);
		}
		return query.lean();
	};

	const getAll = async (req, res, next) => {
		try {
			const { filter, invalidKey } = buildFilter(req.query);
			if (invalidKey) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, `Invalid ${invalidKey} id.`);
			}
			const items = await buildFindWithPopulate(filter, { title: 1 });
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, `${plural} fetched.`, items);
		} catch (err) {
			next(err);
		}
	};

	const getAllAdmin = async (req, res, next) => {
		try {
			const { filter, invalidKey } = buildFilter(req.query);
			if (invalidKey) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, `Invalid ${invalidKey} id.`);
			}
			const items = await buildFindWithPopulate(filter, { createdAt: -1 });
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, `${plural} fetched.`, items);
		} catch (err) {
			next(err);
		}
	};

	const create = async (req, res, next) => {
		try {
			const title = String(req.body?.title || "").trim();
			const parentId = normalizeObjectIdValue(req.body?.[parentField]);
			if (parentId === false) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, `Invalid ${parentField} id.`);
			}
			if (!title || !parentId) {
				return sendJsonResponse(
					res,
					HTTP_STATUS_CODES.BAD_REQUEST,
					false,
					`title and ${parentField} (${parentLabel}) are required.`
				);
			}
			const item = await EntityModel.create({ title, [parentField]: parentId });
			return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, `${label} created.`, item);
		} catch (err) {
			next(err);
		}
	};

	const update = async (req, res, next) => {
		try {
			const title = String(req.body?.title || "").trim();
			const parentId = normalizeObjectIdValue(req.body?.[parentField]);
			if (parentId === false) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, `Invalid ${parentField} id.`);
			}
			if (!title || !parentId) {
				return sendJsonResponse(
					res,
					HTTP_STATUS_CODES.BAD_REQUEST,
					false,
					`title and ${parentField} (${parentLabel}) are required.`
				);
			}
			const item = await EntityModel.findByIdAndUpdate(
				req.params.id,
				{ title, [parentField]: parentId },
				{ new: true, runValidators: true }
			);
			if (!item) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, `${label} not found.`);
			}
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, `${label} updated.`, item);
		} catch (err) {
			next(err);
		}
	};

	const remove = async (req, res, next) => {
		try {
			await EntityModel.findByIdAndDelete(req.params.id);
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, `${label} deleted.`);
		} catch (err) {
			next(err);
		}
	};

	return { getAll, getAllAdmin, create, update, remove };
}

const models = buildCrudHandlers(VehicleModel, {
	label: "Model",
	parentField: "make",
	parentLabel: "make",
	filterQueryKeys: ["make", "subCategory"],
	foreignModel: VehicleMake,
	foreignSelect: "name",
	populate: [{ path: "make", select: "name" }],
});

const years = buildCrudHandlers(VehicleYear, {
	label: "Year",
	parentField: "model",
	parentLabel: "model",
	filterQueryKeys: ["model"],
	foreignModel: VehicleModel,
	foreignSelect: "title make",
	populate: [{ path: "model", select: "title make" }],
});

const trims = buildCrudHandlers(VehicleTrim, {
	label: "Trim",
	parentField: "year",
	parentLabel: "year",
	filterQueryKeys: ["year"],
	foreignModel: VehicleYear,
	foreignSelect: "title model",
	populate: [{ path: "year", select: "title model" }],
});

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

const defaultTrimsGetAll = trims.getAll;
trims.getAll = async (req, res, next) => {
	try {
		const partId = normalizeObjectIdValue(req.query?.part || req.query?.category);
		const makeId = normalizeObjectIdValue(req.query?.make || req.query?.subCategory);
		const modelId = normalizeObjectIdValue(req.query?.model);
		const yearId = normalizeObjectIdValue(req.query?.year);

		if (partId === false || makeId === false || modelId === false || yearId === false) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid part/make/model/year id.");
		}

		if (!partId && !makeId && !modelId) {
			return defaultTrimsGetAll(req, res, next);
		}

		let yearIds = [];
		if (yearId) {
			yearIds = [yearId];
		} else if (modelId) {
			const modelFilter = buildFlexibleIdFilter("model", modelId);
			const yearDocs = await VehicleYear.find(modelFilter).select("_id").lean();
			yearIds = yearDocs.map((item) => String(item._id));
		}

		const andFilters = [];
		if (yearIds.length > 0) {
			const rawYearIds = [...new Set(yearIds.map((id) => String(id || "").trim()).filter(Boolean))];
			const yearObjectIds = rawYearIds
				.filter((id) => mongoose.isValidObjectId(id))
				.map((id) => new mongoose.Types.ObjectId(id));
			andFilters.push({
				$or: [{ year: { $in: rawYearIds } }, ...(yearObjectIds.length ? [{ year: { $in: yearObjectIds } }] : [])],
			});
		}

		const partFilter = partId ? buildFlexibleFieldMatch("part", partId) : null;
		if (partFilter) andFilters.push(partFilter);

		const makeFilter = makeId ? buildFlexibleFieldMatch("make", makeId) : null;
		if (makeFilter) andFilters.push(makeFilter);

		if (andFilters.length === 0) {
			return defaultTrimsGetAll(req, res, next);
		}

		const trimDocs = await VehicleTrim.collection.find({ $and: andFilters }).sort({ title: 1 }).toArray();
		const hydrated = await hydrateForeignField(trimDocs, {
			field: "year",
			model: VehicleYear,
			select: "title model",
		});

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Trims fetched.", hydrated);
	} catch (err) {
		next(err);
	}
};

module.exports = { models, years, trims };
