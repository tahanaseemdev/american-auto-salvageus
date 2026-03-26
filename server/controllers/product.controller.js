const Product = require("../models/Product");
const { sendJsonResponse } = require("../utils/helpers");

async function getProducts(req, res, next) {
	try {
		const { category, subCategory, model, year, trim, featured, q, page = 1, limit = 20 } = req.query;
		const filter = {};

		if (category) filter.category = category;
		if (subCategory) filter.subCategory = subCategory;
		if (model) filter.model = String(model).trim();
		if (year !== undefined && year !== null && year !== "") filter.year = String(year).trim();
		if (trim) filter.trim = String(trim).trim();
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

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Products fetched.", {
			products,
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
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Product fetched.", product);
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
		if (model) filter.model = String(model).trim();
		if (year !== undefined && year !== null && year !== "") filter.year = String(year).trim();
		if (trim) filter.trim = String(trim).trim();
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

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Products fetched.", {
			products,
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
			model: model || "",
			year: year === "" || year === null || year === undefined ? "" : String(year).trim(),
			trim: trim || "",
			featured: Boolean(featured),
			image,
			price,
			category,
			subCategory,
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
