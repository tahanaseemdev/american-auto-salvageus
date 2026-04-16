const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const SOURCE_FILE = "/Users/singlesolution/Documents/scraper/trims_transmission.json";
const SERVER_INDEX = path.join(__dirname, "..", "index.js");

function getMongoUri() {
	const source = fs.readFileSync(SERVER_INDEX, "utf8");
	const fallback = source.match(/mongodb:\/\/[^"']+/)?.[0];
	const uri = process.env.MONGO_DB_CONNECTION_URL || fallback;
	if (!uri) throw new Error("Mongo URI not found from env or server/index.js fallback.");
	return uri;
}

async function main() {
	const uri = getMongoUri();
	const raw = fs.readFileSync(SOURCE_FILE, "utf8");
	const rows = JSON.parse(raw);

	if (!Array.isArray(rows)) {
		throw new Error("Expected trims_transmission.json to contain a JSON array.");
	}

	await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 });
	const db = mongoose.connection.db;
	const col = db.collection("vehicletrims");

	const batchSize = 1000;
	let upserted = 0;
	let replaced = 0;
	let insertedNoId = 0;
	let processed = 0;

	for (let i = 0; i < rows.length; i += batchSize) {
		const chunk = rows.slice(i, i + batchSize);
		const ops = [];

		for (const doc of chunk) {
			if (doc && Object.prototype.hasOwnProperty.call(doc, "_id")) {
				ops.push({
					replaceOne: {
						filter: { _id: doc._id },
						replacement: doc,
						upsert: true,
					},
				});
			} else {
				ops.push({
					insertOne: {
						document: doc,
					},
				});
			}
		}

		if (ops.length === 0) continue;

		const result = await col.bulkWrite(ops, { ordered: false });
		upserted += result.upsertedCount || 0;
		replaced += result.modifiedCount || 0;
		insertedNoId += result.insertedCount || 0;
		processed += ops.length;
	}

	const sourceIds = rows
		.filter((d) => d && Object.prototype.hasOwnProperty.call(d, "_id"))
		.map((d) => d._id);

	let foundIds = 0;
	for (let i = 0; i < sourceIds.length; i += 5000) {
		const subset = sourceIds.slice(i, i + 5000);
		foundIds += await col.countDocuments({ _id: { $in: subset } });
	}

	const withMileageBandsInSource = rows.filter((d) => Array.isArray(d?.mileageBands) && d.mileageBands.length > 0).length;
	const withMileageBandsInDb = await col.countDocuments({ _id: { $in: sourceIds }, "mileageBands.0": { $exists: true } });

	console.log(
		JSON.stringify(
			{
				file: SOURCE_FILE,
				sourceCount: rows.length,
				sourceWithId: sourceIds.length,
				processed,
				upsertedNew: upserted,
				replacedExisting: replaced,
				insertedWithoutId: insertedNoId,
				verifiedIdsPresent: foundIds,
				missingIds: sourceIds.length - foundIds,
				withMileageBandsInSource,
				withMileageBandsInDb,
			},
			null,
			2
		)
	);

	await mongoose.disconnect();
}

main().catch(async (err) => {
	console.error("IMPORT_FAILED", err?.message || err);
	try {
		await mongoose.disconnect();
	} catch {
		// ignore
	}
	process.exit(1);
});
