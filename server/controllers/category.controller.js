const VehiclePart = require("../models/VehiclePart");
const VehicleMake = require("../models/VehicleMake");
const Product = require("../models/Product");
const { sendJsonResponse } = require("../utils/helpers");

async function getAllCategories(req, res, next) {
	try {
		const { featured } = req.query;
		const filter = {};
		if (featured !== undefined) filter.featured = String(featured).toLowerCase() === "true";
		const categories = await VehiclePart.find(filter).sort({ createdAt: -1 }).lean();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Categories fetched.", categories);
	} catch (err) {
		next(err);
	}
}

/**
 * Returns a category along with its sub-categories and direct products.
 * GET /v1/categories/:id
 */
async function getCategoryDetail(req, res, next) {
	try {
		const { id } = req.params;

		const [category, subCategories, products] = await Promise.all([
			VehiclePart.findById(id).lean(),
			VehicleMake.find({ category: id }).lean(),
			Product.find({ category: id }).lean(),
		]);

		if (!category) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Category not found.");
		}

		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Category detail fetched.", {
			category,
			subCategories,
			products,
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
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Categories fetched.", categories);
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
		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Category created.", category);
	} catch (err) {
		next(err);
	}
}

async function updateCategory(req, res, next) {
	try {
		const { id } = req.params;
		const updates = req.body;
		const category = await VehiclePart.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
		if (!category) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Category not found.");
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Category updated.", category);
	} catch (err) {
		next(err);
	}
}

async function deleteCategory(req, res, next) {
	try {
		const { id } = req.params;
		await VehiclePart.findByIdAndDelete(id);
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Category deleted.");
	} catch (err) {
		next(err);
	}
}

// ── Admin Sub-Category CRUD ───────────────────────────────────────────────────

async function createSubCategory(req, res, next) {
	try {
		const { name, category, image } = req.body;
		if (!name || !category) {
			return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "name and category are required.");
		}
		const sub = await VehicleMake.create({ name, category, image });
		return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, "Sub-category created.", sub);
	} catch (err) {
		next(err);
	}
}

async function getSubCategories(req, res, next) {
	try {
		const { category } = req.query;
		const filter = category ? { category } : {};
		const subs = await VehicleMake.find(filter).populate("category", "title").lean();
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Sub-categories fetched.", subs);
	} catch (err) {
		next(err);
	}
}

async function updateSubCategory(req, res, next) {
	try {
		const sub = await VehicleMake.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!sub) return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, "Sub-category not found.");
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Sub-category updated.", sub);
	} catch (err) {
		next(err);
	}
}

async function deleteSubCategory(req, res, next) {
	try {
		await VehicleMake.findByIdAndDelete(req.params.id);
		return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, "Sub-category deleted.");
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
