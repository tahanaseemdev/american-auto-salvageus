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

function buildCrudHandlers(EntityModel, options) {
	const { label, parentField, parentLabel, filterQueryKeys = [], populate = [] } = options;
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
					filter[parentField] = normalized;
				}
				break;
			}
		}
		return { filter, invalidKey: null };
	};

	const buildFindWithPopulate = (filter, sort) => {
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
	populate: [{ path: "make", select: "name" }],
});

const years = buildCrudHandlers(VehicleYear, {
	label: "Year",
	parentField: "model",
	parentLabel: "model",
	filterQueryKeys: ["model"],
	populate: [{ path: "model", select: "title make" }],
});

const trims = buildCrudHandlers(VehicleTrim, {
	label: "Trim",
	parentField: "year",
	parentLabel: "year",
	filterQueryKeys: ["year"],
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

		if (partId && makeId && modelId && yearId) {
			const [part, make, model, year] = await Promise.all([
				VehiclePart.findById(partId).select("title").lean(),
				VehicleMake.findById(makeId).select("name").lean(),
				VehicleModel.findById(modelId).select("title").lean(),
				VehicleYear.findById(yearId).select("title").lean(),
			]);

			if (part && make && model && year) {
				const liveTrims = await fetchLiveTrimsBySelection({
					partTitle: part.title,
					makeName: make.name,
					modelTitle: model.title,
					yearTitle: year.title,
				});

				if (liveTrims.length > 0) {
					return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Trims fetched.", liveTrims);
				}
			}
		}

		return defaultTrimsGetAll(req, res, next);
	} catch (err) {
		next(err);
	}
};

module.exports = { models, years, trims };
