const mongoose = require("mongoose");
const Product = require("../models/Product");
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
		const product = await Product.create({
			name,
			model: model || null,
			year: year || null,
			trim: trim || null,
			featured: Boolean(featured),
			image,
			price,
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
		const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
