/**
 * Seeds demo requests. Safe to run repeatedly: it does nothing if the table
 * already has rows, unless `--force` is passed (which replaces everything).
 *
 *   npx tsx prisma/seed.ts          # seed only if empty (runs before `npm run dev`)
 *   npx tsx prisma/seed.ts --force  # wipe and reseed (`npm run db:seed`)
 */
import { db } from "../src/lib/db";
import { SEED_REQUESTS } from "./seed-data";

const HOUR = 60 * 60 * 1000;

async function main() {
  const force = process.argv.includes("--force");
  const existing = await db.request.count();

  if (existing > 0 && !force) {
    console.log(`Seed skipped: database already has ${existing} requests.`);
    return;
  }

  // Dates are relative to now so the demo always looks recent.
  const now = Date.now();
  const rows = SEED_REQUESTS.map(({ ageHours, ...request }) => {
    const createdAt = new Date(now - ageHours * HOUR);
    // Requests that have moved on from NEW were last touched after creation.
    const hoursUntilLastUpdate = request.status === "NEW" ? 0 : Math.min(ageHours / 2, 48);
    const updatedAt = new Date(createdAt.getTime() + hoursUntilLastUpdate * HOUR);
    return { ...request, createdAt, updatedAt };
  });

  await db.$transaction([db.request.deleteMany(), db.request.createMany({ data: rows })]);
  console.log(`Seeded ${rows.length} requests.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
