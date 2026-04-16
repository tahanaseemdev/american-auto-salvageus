const fs = require('fs');
const mongoose = require('mongoose');

const indexSource = fs.readFileSync('/Users/singlesolution/Documents/scraper/american-auto/american-auto-salvageus/server/index.js', 'utf8');
const fallbackUri = indexSource.match(/mongodb:\/\/[^"']+/)?.[0];
const uri = process.env.MONGO_DB_CONNECTION_URL || fallbackUri;

if (!uri) {
  throw new Error('Mongo URI not found from env or server/index.js fallback.');
}

const files = [
  '/Users/singlesolution/Documents/scraper/trims.json',
  '/Users/singlesolution/Documents/scraper/Door-Assembly-Front-to-Flywheel.json',
  '/Users/singlesolution/Documents/scraper/axle-shaft-to-cooling-fan.json'
];

(async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 });
  const db = mongoose.connection.db;
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

  const exists = await db.listCollections({ name: 'vehicletrims' }).toArray();
  let backupName = null;

  if (exists.length) {
    backupName = `vehicletrims_backup_${stamp}_${Math.floor(Math.random() * 1000)}`;
    await db.collection('vehicletrims').rename(backupName, { dropTarget: false });
    console.log('Backup created:', backupName);
  }

  const trims = db.collection('vehicletrims');
  const seen = new Set();
  let inserted = 0;
  let skippedDup = 0;

  for (const file of files) {
    const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
    let fileMileage = 0;
    let fileInserted = 0;
    let batch = [];

    for (const doc of rows) {
      if (Array.isArray(doc?.mileageBands) && doc.mileageBands.length > 0) fileMileage += 1;

      const id = String(doc?._id ?? '');
      if (id && seen.has(id)) {
        skippedDup += 1;
        continue;
      }
      if (id) seen.add(id);

      batch.push(doc);
      if (batch.length >= 5000) {
        await trims.insertMany(batch, { ordered: false });
        inserted += batch.length;
        fileInserted += batch.length;
        batch = [];
      }
    }

    if (batch.length) {
      await trims.insertMany(batch, { ordered: false });
      inserted += batch.length;
      fileInserted += batch.length;
    }

    console.log(`Imported file: ${file}`);
    console.log(`  source: ${rows.length}, sourceWithMileage: ${fileMileage}, inserted: ${fileInserted}`);
  }

  const total = await trims.countDocuments();
  const withBands = await trims.countDocuments({ 'mileageBands.0': { $exists: true } });

  console.log(JSON.stringify({ backupName, inserted, skippedDup, total, withBands }, null, 2));
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('Import failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
