const mongoose = require("mongoose");
const Product = require("../models/Product");
const VehiclePart = require("../models/VehiclePart");
const VehicleMake = require("../models/VehicleMake");
const VehicleModel = require("../models/VehicleModel");
const VehicleYear = require("../models/VehicleYear");
const VehicleTrim = require("../models/VehicleTrim");
const { sendJsonResponse } = require("../utils/helpers");

const STATIC_PRODUCT_PRICES = new Map([
	["65f1a001c12d4a001a000016-69cfbed27b92a7441ac50bd3-69cfc2df7b92a7441ac54130-69cfc2fc7b92a7441ac541c6-911800663e091e76169d5282", 1165],
	["69cfbed17b92a7441ac50ba3-69cfbed27b92a7441ac50bbe-69cfc0ea7b92a7441ac52d10-69cfc0ff7b92a7441ac52dcf-74aa49358bbb16ec24043c1b", 9140],
	["69cfbed17b92a7441ac50ba3-69cfbed27b92a7441ac50bab-69cfbf837b92a7441ac514fb-69cfbfa57b92a7441ac517ab-9657809acf4becee3152bcee", 949],
	["65f1a001c12d4a001a000016-69cfbed27b92a7441ac50baf-69cfbfd77b92a7441ac51b91-69cfbfea7b92a7441ac51cfa-927cea07235dc2ad97060ee2", 3536],
]);

const MILEAGE_PART_PATTERN = /\b(engine|transmission)s?\b/i;

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

const normalizePriceValue = (value) => {
	if (value === null || value === undefined || value === "") return 0;
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;

	const normalized = String(value).replace(/[^0-9.-]/g, "");
	if (!normalized || normalized === "." || normalized === "-" || normalized === "-.") return 0;

	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : 0;
};

const isMileagePricedPart = (partTitle) => {
	const key = String(partTitle || "").trim();
	return MILEAGE_PART_PATTERN.test(key);
};

const normalizeMileageBands = (trimDoc) => {
	if (!Array.isArray(trimDoc?.mileageBands)) return [];

	return trimDoc.mileageBands
		.map((band, index) => {
			const key = String(band?.key || `price${index + 1}`).trim() || `price${index + 1}`;
			const label = String(band?.label || "").trim() || String(band?.mileage || "").trim() || `Option ${index + 1}`;
			const mileage = String(band?.mileage || "").trim();
			const amount = normalizePriceValue(band?.amount ?? band?.price);

			return {
				key,
				label,
				mileage,
				price: String((band?.price ?? amount) || "").trim(),
				amount,
				selected: Boolean(band?.selected),
			};
		})
		.filter((band) => band.label && Number.isFinite(band.amount) && band.amount >= 0);
};

const resolveSelectedMileageBand = (mileageBands, requestedBandKey) => {
	if (!Array.isArray(mileageBands) || mileageBands.length === 0) {
		return { mileageBands: [], selectedMileageBand: null };
	}

	const requested = String(requestedBandKey || "").trim().toLowerCase();
	let selected = null;

	if (requested) {
		selected = mileageBands.find((band) => String(band.key || "").trim().toLowerCase() === requested);
	}

	if (!selected) {
		selected = mileageBands.find((band) => band.selected) || mileageBands[0];
	}

	const selectedKey = String(selected?.key || "").trim();
	const normalizedBands = mileageBands.map((band) => ({
		...band,
		selected: String(band.key || "").trim() === selectedKey,
	}));

	return {
		mileageBands: normalizedBands,
		selectedMileageBand: normalizedBands.find((band) => band.selected) || null,
	};
};

function buildProjection(select) {
	const fields = String(select || "")
		.split(/\s+/)
		.map((field) => field.trim())
		.filter(Boolean)
		.filter((field) => !field.startsWith("-"));
	if (fields.length === 0) return undefined;
	const projection = { _id: 1 };
	for (const field of fields) projection[field] = 1;
	return projection;
}

async function findByIdFlexible(EntityModel, id, select = "") {
	const rawId = String(id || "").trim();
	if (!rawId) return null;

	const variants = [rawId];
	if (mongoose.isValidObjectId(rawId)) {
		variants.push(new mongoose.Types.ObjectId(rawId));
	}

	return EntityModel.collection.findOne({ _id: { $in: variants } }, { projection: buildProjection(select) });
}

function parseSyntheticProductId(value) {
	const parts = String(value || "")
		.split("-")
		.map((item) => item.trim())
		.filter(Boolean);

	if (parts.length < 3 || parts.length > 5) return null;

	const [partId, makeId, modelId, yearId = null, trimId = null] = parts;
	if (!partId || !makeId || !modelId) return null;

	return { partId, makeId, modelId, yearId, trimId };
}

async function buildSyntheticProductById(syntheticId, { mileageBandKey } = {}) {
	const parsed = parseSyntheticProductId(syntheticId);
	if (!parsed) return null;

	const [part, make, model, year, trim] = await Promise.all([
		findByIdFlexible(VehiclePart, parsed.partId, "title image"),
		findByIdFlexible(VehicleMake, parsed.makeId, "name"),
		findByIdFlexible(VehicleModel, parsed.modelId, "title"),
		parsed.yearId ? findByIdFlexible(VehicleYear, parsed.yearId, "title") : null,
		parsed.trimId ? findByIdFlexible(VehicleTrim, parsed.trimId, "title price mileageBands") : null,
	]);

	if (!part || !make || !model) return null;

	const name = [year?.title, make?.name, model?.title, part?.title, trim?.title].filter(Boolean).join(" ");
	const mileagePriced = isMileagePricedPart(part?.title);
	const rawMileageBands = mileagePriced ? normalizeMileageBands(trim) : [];
	const { mileageBands, selectedMileageBand } = resolveSelectedMileageBand(rawMileageBands, mileageBandKey);
	const syntheticFallbackPrice = STATIC_PRODUCT_PRICES.get(String(syntheticId)) || 0;
	const resolvedPrice = selectedMileageBand
		? normalizePriceValue(selectedMileageBand.amount)
		: trim?.price !== undefined && trim?.price !== null
			? normalizePriceValue(trim.price)
			: syntheticFallbackPrice;

	return {
		_id: String(syntheticId),
		name: name || [make?.name, model?.title, part?.title].filter(Boolean).join(" "),
		model: model || null,
		year: year || null,
		trim: trim || null,
		featured: false,
		image: part?.image || "",
		price: resolvedPrice,
		category: part ? { _id: String(part._id), title: part.title } : null,
		subCategory: make ? { _id: String(make._id), name: make.name } : null,
		mileageBands,
		selectedMileageBand,
		priceSource: selectedMileageBand ? "mileageBand" : "trim",
		mileagePriced,
		synthetic: true,
	};
}

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
			price: normalizePriceValue(item.price),
			model: modelMap.get(modelId) || toTitleObject(item.model),
			year: yearMap.get(yearId) || toTitleObject(item.year),
			trim: trimMap.get(trimId) || toTitleObject(item.trim),
		};
	});
}

async function getProducts(req, res, next) {
	try {
		const { category, subCategory, model, year, trim, featured, q, page = 1, limit = 20 } = req.query;
		const filter = {};

		if (category) filter.category = category;
		if (subCategory) filter.subCategory = subCategory;
		if (model) {
			if (!isValidId(model)) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid model id.");
			}
			filter.model = model;
		}
		if (year) {
			if (!isValidId(year)) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid year id.");
			}
			filter.year = year;
		}
		if (trim) {
			if (!isValidId(trim)) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid trim id.");
			}
			filter.trim = trim;
		}
		if (featured !== undefined) filter.featured = String(featured).toLowerCase() === "true";
		if (q) {
			filter.$text = { $search: q };
		}

		const skip = (Number(page) - 1) * Number(limit);
		const [products, total] = await Promise.all([
			Product.find(filter)
				.populate("category", "title")
				.populate("subCategory", "name")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			Product.countDocuments(filter),
		]);

		const hydratedProducts = await hydrateVehicleRefs(products);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Products fetched.", {
			products: hydratedProducts,
			pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
		});
	} catch (err) {
		next(err);
	}
}

async function getProductById(req, res, next) {
	try {
		if (!isValidId(req.params.id)) {
			const syntheticProduct = await buildSyntheticProductById(req.params.id, {
				mileageBandKey: req.query?.mileageBand || req.query?.band,
			});
			if (syntheticProduct) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Product fetched.", syntheticProduct);
			}
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Product not found.");
		}

		const product = await Product.findById(req.params.id)
			.populate("category", "title")
			.populate("subCategory", "name")
			.lean();
		if (!product) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Product not found.");

		const [hydratedProduct] = await hydrateVehicleRefs([product]);
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Product fetched.", hydratedProduct);
	} catch (err) {
		next(err);
	}
}

// ── Admin CRUD ────────────────────────────────────────────────────────────────

async function adminGetAll(req, res, next) {
	try {
		const { category, subCategory, model, year, trim, featured, q, page = 1, limit = 20 } = req.query;
		const filter = {};
		if (category) filter.category = category;
		if (subCategory) filter.subCategory = subCategory;
		if (model) {
			if (!isValidId(model)) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid model id.");
			}
			filter.model = model;
		}
		if (year) {
			if (!isValidId(year)) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid year id.");
			}
			filter.year = year;
		}
		if (trim) {
			if (!isValidId(trim)) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "Invalid trim id.");
			}
			filter.trim = trim;
		}
		if (featured !== undefined) filter.featured = String(featured).toLowerCase() === "true";
		if (q) filter.$text = { $search: q };

		const skip = (Number(page) - 1) * Number(limit);
		const [products, total] = await Promise.all([
			Product.find(filter)
				.populate("category", "title")
				.populate("subCategory", "name")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			Product.countDocuments(filter),
		]);

		const hydratedProducts = await hydrateVehicleRefs(products);

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Products fetched.", {
			products: hydratedProducts,
			pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
		});
	} catch (err) {
		next(err);
	}
}

async function createProduct(req, res, next) {
	try {
		const { name, model, year, trim, featured, image, price, category, subCategory } = req.body;
		if (!name || price === undefined || price === null || !category) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "name, price, and category are required.");
		}

		const normalizedPrice = normalizePriceValue(price);
		if (normalizedPrice < 0) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "price must be greater than or equal to 0.");
		}

		const product = await Product.create({
			name,
			model: model || null,
			year: year || null,
			trim: trim || null,
			featured: Boolean(featured),
			image,
			price: normalizedPrice,
			category,
			subCategory: subCategory || null,
		});
		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Product created.", product);
	} catch (err) {
		next(err);
	}
}

async function updateProduct(req, res, next) {
	try {
		const payload = { ...req.body };
		if (Object.prototype.hasOwnProperty.call(payload, "price")) {
			payload.price = normalizePriceValue(payload.price);
			if (payload.price < 0) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "price must be greater than or equal to 0.");
			}
		}

		const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
		if (!product) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Product not found.");
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Product updated.", product);
	} catch (err) {
		next(err);
	}
}

async function deleteProduct(req, res, next) {
	try {
		await Product.findByIdAndDelete(req.params.id);
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Product deleted.");
	} catch (err) {
		next(err);
	}
}

module.exports = { getProducts, getProductById, adminGetAll, createProduct, updateProduct, deleteProduct };
