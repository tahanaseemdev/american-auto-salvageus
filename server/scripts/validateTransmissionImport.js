const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const SOURCE_FILE = "/Users/singlesolution/Documents/scraper/trims_transmission.json";
const SERVER_INDEX = path.join(__dirname, "..", "index.js");

function getMongoUri() {
	const source = fs.readFileSync(SERVER_INDEX, "utf8");
	const fallback = source.match(/mongodb:\/\/[^"']+/)?.[0];
	const uri = process.env.MONGO_DB_CONNECTION_URL || fallback;
	if (!uri) throw new Error("Mongo URI not found.");
	return uri;
}

async function main() {
	const rows = JSON.parse(fs.readFileSync(SOURCE_FILE, "utf8"));
	const trim = rows.find((r) => Array.isArray(r?.mileageBands) && r.mileageBands.length && r.part && r.make && r.year && r._id);
	if (!trim) throw new Error("No transmission trim with mileageBands found in source file.");

	await mongoose.connect(getMongoUri(), { serverSelectionTimeoutMS: 30000 });
	const db = mongoose.connection.db;
	const year = await db.collection("vehicleyears").findOne({ _id: trim.year });
	if (!year) throw new Error("Matching year document not found for selected trim.");

	const syntheticId = `${trim.part}-${trim.make}-${year.model}-${trim.year}-${trim._id}`;
	await mongoose.disconnect();

	const response = await fetch(`http://localhost:5010/v1/products/${syntheticId}`);
	const body = await response.json();

	console.log(
		JSON.stringify(
			{
				syntheticId,
				status: response.status,
				hasMileageBands: Array.isArray(body?.data?.mileageBands) && body.data.mileageBands.length > 0,
				selectedMileageBand: body?.data?.selectedMileageBand?.key || null,
				price: body?.data?.price ?? null,
			},
			null,
			2
		)
	);
}

main().catch(async (err) => {
	console.error("VALIDATION_FAILED", err?.message || err);
	try {
		await mongoose.disconnect();
	} catch {
		// ignore
	}
	process.exit(1);
});
