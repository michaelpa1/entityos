import { db } from "./index";
import {
  identityProfile,
  claims,
  assets,
  roadmapItems,
} from "./schema";

/**
 * Seed script for Entity OS Phase 1.
 *
 * Populates: 1 identity profile, 9 claims, 14 assets, 15 roadmap items.
 * Run with a live DATABASE_URL configured: `pnpm run db:seed`.
 */

async function seed() {
  console.log("Seeding Entity OS database...");

  // -------------------------------------------------------------------------
  // Identity (1 row)
  // -------------------------------------------------------------------------
  await db.insert(identityProfile).values({
    canonicalName: "Michael Pearson-Adams",
    preferredName: "Michael Pearson-Adams",
    primaryTitle:
      "Australian Product Strategist, Author, Speaker & Creative Technologist",
    canonicalIdentitySentence:
      "Michael Pearson-Adams is an Australian product strategist, author, speaker and creative technologist whose work spans AI, audio technology, product management and creative innovation.",
    website: "https://michaelpa.com",
    location: "Brisbane, Australia",
  });
  console.log("  ✓ identity_profile: 1 row");

  // -------------------------------------------------------------------------
  // Claims (9 items)
  // -------------------------------------------------------------------------
  await db.insert(claims).values([
    {
      statement: "Product Manager at Waves Audio",
      entityRole: "product_manager",
      confidence: "high",
      importance: "critical",
    },
    {
      statement: "Associated with Waves Stream",
      entityRole: "product_manager",
      confidence: "high",
      importance: "high",
    },
    {
      statement: "Associated with Voice ReGen",
      entityRole: "product_manager",
      confidence: "medium",
      importance: "high",
    },
    {
      statement: "Author",
      entityRole: "author",
      confidence: "high",
      importance: "high",
    },
    {
      statement: "Speaker",
      entityRole: "speaker",
      confidence: "high",
      importance: "high",
    },
    {
      statement: "Photographer",
      entityRole: "photographer",
      confidence: "medium",
      importance: "medium",
    },
    {
      statement: "AI Product Builder",
      entityRole: "ai_product_builder",
      confidence: "high",
      importance: "high",
    },
    {
      statement: "Based in Brisbane",
      entityRole: null,
      confidence: "high",
      importance: "medium",
    },
    {
      statement: "Alias: MPA",
      entityRole: null,
      confidence: "medium",
      importance: "low",
    },
  ]);
  console.log("  ✓ claims: 9 rows");

  // -------------------------------------------------------------------------
  // Assets (14 items)
  // -------------------------------------------------------------------------
  await db.insert(assets).values([
    {
      name: "michaelpa.com",
      assetType: "website",
      url: "https://michaelpa.com",
      status: "active",
      ownershipType: "owned",
    },
    {
      name: "LinkedIn",
      assetType: "professional_profile",
      url: "https://www.linkedin.com/in/michaelpearsonadams",
      status: "active",
      ownershipType: "controlled",
    },
    {
      name: "Waves StudioVerse",
      assetType: "company_page",
      status: "active",
      ownershipType: "affiliated",
    },
    {
      name: "Waves Stream",
      assetType: "ai_product",
      status: "active",
      ownershipType: "affiliated",
    },
    {
      name: "Voice ReGen",
      assetType: "ai_product",
      status: "active",
      ownershipType: "affiliated",
    },
    {
      name: "Podcast",
      assetType: "podcast",
      status: "active",
      ownershipType: "owned",
    },
    {
      name: "Just Start",
      assetType: "book",
      status: "active",
      ownershipType: "owned",
    },
    {
      name: "Photography",
      assetType: "photography",
      status: "active",
      ownershipType: "owned",
    },
    {
      name: "Advisory",
      assetType: "advisory",
      status: "active",
      ownershipType: "owned",
    },
    {
      name: "Krucbl",
      assetType: "ai_product",
      status: "active",
      ownershipType: "owned",
    },
    {
      name: "FreddyHi",
      assetType: "ai_product",
      status: "active",
      ownershipType: "owned",
    },
    {
      name: "FairTimeTo",
      assetType: "ai_product",
      status: "planned",
      ownershipType: "owned",
    },
    {
      name: "rurlyok",
      assetType: "ai_product",
      status: "planned",
      ownershipType: "owned",
    },
    {
      name: "Brisbane Business Hub",
      assetType: "company_page",
      status: "active",
      ownershipType: "affiliated",
    },
  ]);
  console.log("  ✓ assets: 14 rows");

  // -------------------------------------------------------------------------
  // Roadmap (15 items — spec is source of truth; task doc said 12)
  // -------------------------------------------------------------------------
  await db.insert(roadmapItems).values([
    {
      title: "Define Canonical Identity",
      category: "Identity",
      priority: "critical",
      impact: "high",
      effort: "low",
      status: "in_progress",
    },
    {
      title: "Person Schema",
      category: "Schema",
      priority: "critical",
      impact: "high",
      effort: "medium",
      status: "backlog",
    },
    {
      title: "Book Schema",
      category: "Schema",
      priority: "high",
      impact: "high",
      effort: "medium",
      status: "backlog",
    },
    {
      title: "Media Page",
      category: "Content",
      priority: "high",
      impact: "medium",
      effort: "medium",
      status: "backlog",
    },
    {
      title: "Speaking Page",
      category: "Content",
      priority: "medium",
      impact: "medium",
      effort: "medium",
      status: "backlog",
    },
    {
      title: "Author Page",
      category: "Content",
      priority: "high",
      impact: "high",
      effort: "medium",
      status: "backlog",
    },
    {
      title: "Press Kit",
      category: "Content",
      priority: "medium",
      impact: "medium",
      effort: "medium",
      status: "backlog",
    },
    {
      title: "Amazon Author",
      category: "Profiles",
      priority: "high",
      impact: "high",
      effort: "low",
      status: "backlog",
    },
    {
      title: "Goodreads",
      category: "Profiles",
      priority: "medium",
      impact: "medium",
      effort: "low",
      status: "backlog",
    },
    {
      title: "LinkedIn Consistency",
      category: "Profiles",
      priority: "high",
      impact: "high",
      effort: "low",
      status: "backlog",
    },
    {
      title: "YouTube Consistency",
      category: "Profiles",
      priority: "medium",
      impact: "medium",
      effort: "low",
      status: "backlog",
    },
    {
      title: "Canonical Headshot",
      category: "Identity",
      priority: "high",
      impact: "medium",
      effort: "low",
      status: "backlog",
    },
    {
      title: "Google Snapshot",
      category: "Search",
      priority: "medium",
      impact: "medium",
      effort: "low",
      status: "backlog",
    },
    {
      title: "Gemini Snapshot",
      category: "AI",
      priority: "medium",
      impact: "medium",
      effort: "low",
      status: "backlog",
    },
    {
      title: "Perplexity Snapshot",
      category: "AI",
      priority: "medium",
      impact: "medium",
      effort: "low",
      status: "backlog",
    },
  ]);
  console.log("  ✓ roadmap_items: 15 rows");

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
