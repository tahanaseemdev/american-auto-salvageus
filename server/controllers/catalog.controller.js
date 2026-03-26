const VehicleModel = require("../models/VehicleModel");
const VehicleYear = require("../models/VehicleYear");
const VehicleTrim = require("../models/VehicleTrim");
const { sendJsonResponse } = require("../utils/helpers");

function buildCrudHandlers(EntityModel, label) {
	const plural = `${label}s`;

	const getAll = async (_req, res, next) => {
		try {
			const items = await EntityModel.find().sort({ title: 1 }).lean();
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, `${plural} fetched.`, items);
		} catch (err) {
			next(err);
		}
	};

	const getAllAdmin = async (_req, res, next) => {
		try {
			const items = await EntityModel.find().sort({ createdAt: -1 }).lean();
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, `${plural} fetched.`, items);
		} catch (err) {
			next(err);
		}
	};

	const create = async (req, res, next) => {
		try {
			const title = String(req.body?.title || "").trim();
			if (!title) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "title is required.");
			}
			const item = await EntityModel.create({ title });
			return sendJsonResponse(res, HTTP_STATUS_CODES.CREATED, true, `${label} created.`, item);
		} catch (err) {
			if (err?.code === 11000) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.CONFLICT, false, `${label} title already exists.`);
			}
			next(err);
		}
	};

	const update = async (req, res, next) => {
		try {
			const title = String(req.body?.title || "").trim();
			if (!title) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.BAD_REQUEST, false, "title is required.");
			}
			const item = await EntityModel.findByIdAndUpdate(
				req.params.id,
				{ title },
				{ new: true, runValidators: true }
			);
			if (!item) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.NOT_FOUND, false, `${label} not found.`);
			}
			return sendJsonResponse(res, HTTP_STATUS_CODES.OK, true, `${label} updated.`, item);
		} catch (err) {
			if (err?.code === 11000) {
				return sendJsonResponse(res, HTTP_STATUS_CODES.CONFLICT, false, `${label} title already exists.`);
			}
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

const models = buildCrudHandlers(VehicleModel, "Model");
const years = buildCrudHandlers(VehicleYear, "Year");
const trims = buildCrudHandlers(VehicleTrim, "Trim");

module.exports = { models, years, trims };
