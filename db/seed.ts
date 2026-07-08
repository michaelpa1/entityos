import { db } from "./index";
import {
  identityProfile,
  claims,
  assets,
  roadmapItems,
  schemaItems,
} from "./schema";
import {
  assetSeedValues,
  claimSeedValues,
  roadmapSeedValues,
  schemaSeedValues,
} from "./seed-data";

/**
 * Seed script for Entity OS.
 *
 * Populates: 1 identity profile, 9 claims, 14 assets, 12 roadmap items,
 * and the schema-items checklist.
 * Run with a live DATABASE_URL configured: `pnpm run db:seed`.
 */

async function seed() {
  console.log("Seeding Entity OS database...");

  // -------------------------------------------------------------------------
  // Identity (1 row)
  // -------------------------------------------------------------------------
  await db.insert(identityProfile).values({
    canonicalName: "Michael Pearson-Adams",
    preferredShortName: "Michael Pearson-Adams",
    primaryTitle:
      "Australian Product Strategist, Author, Speaker & Creative Technologist",
    canonicalIdentitySentence:
      "Michael Pearson-Adams is an Australian product strategist, author, speaker and creative technologist whose work spans AI, audio technology, product management and creative innovation.",
    canonicalWebsiteUrl: "https://michaelpa.com",
    location: "Brisbane, Australia",
  });
  console.log("  ✓ identity_profile: 1 row");

  // -------------------------------------------------------------------------
  // Claims (9 items)
  // -------------------------------------------------------------------------
  await db.insert(claims).values(claimSeedValues);
  console.log(`  ✓ claims: ${claimSeedValues.length} rows`);

  // -------------------------------------------------------------------------
  // Assets (14 items)
  // -------------------------------------------------------------------------
  await db.insert(assets).values(assetSeedValues);
  console.log(`  ✓ assets: ${assetSeedValues.length} rows`);

  // -------------------------------------------------------------------------
  // Roadmap (12 items)
  // -------------------------------------------------------------------------
  await db.insert(roadmapItems).values(roadmapSeedValues);
  console.log(`  ✓ roadmap_items: ${roadmapSeedValues.length} rows`);

  // -------------------------------------------------------------------------
  // Schema checklist
  // -------------------------------------------------------------------------
  await db.insert(schemaItems).values(schemaSeedValues);
  console.log(`  ✓ schema_items: ${schemaSeedValues.length} rows`);

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
