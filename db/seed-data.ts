import type {
  NewAsset,
  NewClaim,
  NewRoadmapItem,
  NewSchemaItem,
} from "./schema";

/**
 * Canonical seed list for the `claims` table (9 items from the spec).
 * Shared by the full seed (`db/seed.ts`) and the claims-only reseed.
 */
export const claimSeedValues: NewClaim[] = [
  {
    claimText: "Michael Pearson-Adams is a Product Manager at Waves Audio",
    claimType: "role",
    confidence: "strong",
    publicImportance: "high",
    shouldBePublic: true,
  },
  {
    claimText: "Michael Pearson-Adams works on Waves Stream",
    claimType: "product",
    confidence: "strong",
    publicImportance: "high",
    shouldBePublic: true,
  },
  {
    claimText: "Michael Pearson-Adams works on Voice ReGen",
    claimType: "product",
    confidence: "moderate",
    publicImportance: "high",
    shouldBePublic: true,
  },
  {
    claimText: "Michael Pearson-Adams is an author",
    claimType: "role",
    confidence: "strong",
    publicImportance: "high",
    shouldBePublic: true,
  },
  {
    claimText: "Michael Pearson-Adams is a speaker",
    claimType: "speaking",
    confidence: "strong",
    publicImportance: "high",
    shouldBePublic: true,
  },
  {
    claimText: "Michael Pearson-Adams is a photographer",
    claimType: "role",
    confidence: "moderate",
    publicImportance: "medium",
    shouldBePublic: true,
  },
  {
    claimText: "Michael Pearson-Adams is an AI product builder",
    claimType: "expertise",
    confidence: "strong",
    publicImportance: "high",
    shouldBePublic: true,
  },
  {
    claimText: "Michael Pearson-Adams is based in Brisbane, Australia",
    claimType: "location",
    confidence: "strong",
    publicImportance: "medium",
    shouldBePublic: true,
  },
  {
    claimText: "Michael Pearson-Adams uses the alias MPA",
    claimType: "identity",
    confidence: "moderate",
    publicImportance: "low",
    shouldBePublic: false,
  },
];

/**
 * Canonical seed list for the `assets` table (14 items from the spec).
 * Shared by the full seed (`db/seed.ts`) and the assets-only reseed.
 */
export const assetSeedValues: NewAsset[] = [
  {
    name: "michaelpa.com",
    assetType: "website",
    url: "https://michaelpa.com",
    status: "active",
    ownershipType: "owned",
    entityRole: "primary_canonical",
    authorityScore: 95,
    consistencyScore: 98,
    notes: "Canonical hub. Source of truth for identity, bios and links.",
  },
  {
    name: "LinkedIn",
    assetType: "professional_profile",
    url: "https://www.linkedin.com/in/michaelpearsonadams",
    status: "active",
    ownershipType: "social",
    entityRole: "supporting",
    authorityScore: 82,
    consistencyScore: 85,
  },
  {
    name: "Waves StudioVerse",
    assetType: "company_page",
    url: "https://www.waves.com/studioverse",
    status: "active",
    ownershipType: "employer",
    entityRole: "supporting",
    authorityScore: 74,
    consistencyScore: 70,
  },
  {
    name: "Waves Stream",
    assetType: "product",
    status: "active",
    ownershipType: "employer",
    entityRole: "evidence",
    authorityScore: 68,
    consistencyScore: 60,
  },
  {
    name: "Voice ReGen",
    assetType: "product",
    status: "active",
    ownershipType: "employer",
    entityRole: "evidence",
    authorityScore: 66,
    consistencyScore: 58,
  },
  {
    name: "Podcast",
    assetType: "podcast",
    status: "active",
    ownershipType: "owned",
    entityRole: "supporting",
    authorityScore: 55,
    consistencyScore: 62,
  },
  {
    name: "Just Start",
    assetType: "book",
    status: "active",
    ownershipType: "owned",
    entityRole: "supporting",
    authorityScore: 60,
    consistencyScore: 72,
  },
  {
    name: "Photography",
    assetType: "photography",
    status: "active",
    ownershipType: "owned",
    entityRole: "weak_signal",
    authorityScore: 40,
    consistencyScore: 45,
  },
  {
    name: "Advisory",
    assetType: "other",
    status: "needs_review",
    ownershipType: "owned",
    entityRole: "weak_signal",
    authorityScore: 35,
    consistencyScore: 38,
  },
  {
    name: "Krucbl",
    assetType: "product",
    status: "active",
    ownershipType: "owned",
    entityRole: "supporting",
    authorityScore: 48,
    consistencyScore: 50,
  },
  {
    name: "FreddyHi",
    assetType: "product",
    status: "active",
    ownershipType: "owned",
    entityRole: "supporting",
    authorityScore: 46,
    consistencyScore: 47,
  },
  {
    name: "FairTimeTo",
    assetType: "product",
    status: "incomplete",
    ownershipType: "owned",
    entityRole: "weak_signal",
    authorityScore: 20,
    consistencyScore: 15,
  },
  {
    name: "rurlyok",
    assetType: "product",
    status: "incomplete",
    ownershipType: "owned",
    entityRole: "weak_signal",
    authorityScore: 18,
    consistencyScore: 12,
  },
  {
    name: "Brisbane Business Hub",
    assetType: "company_page",
    status: "active",
    ownershipType: "directory",
    entityRole: "weak_signal",
    authorityScore: 30,
    consistencyScore: 33,
  },
];

/**
 * Canonical seed list for the `roadmap_items` table (12 items from the spec).
 * Values use the Phase 6 enums: priority = now/next/later/someday,
 * effort = small/medium/large, category = the fixed category set.
 */
export const roadmapSeedValues: NewRoadmapItem[] = [
  {
    title: "Lock the canonical identity sentence",
    description:
      "Agree one canonical name, title and one-line identity used everywhere.",
    category: "identity",
    priority: "now",
    impact: "high",
    effort: "small",
    status: "in_progress",
  },
  {
    title: "Publish Person schema on the canonical site",
    description:
      "Add JSON-LD Person markup to michaelpa.com with sameAs links.",
    category: "schema",
    priority: "now",
    impact: "high",
    effort: "medium",
    status: "backlog",
  },
  {
    title: "Build the canonical author / about page",
    description: "A single authoritative about page other sources can cite.",
    category: "website",
    priority: "now",
    impact: "high",
    effort: "medium",
    status: "backlog",
  },
  {
    title: "Align LinkedIn to the canonical identity",
    description:
      "Match headline, about and name to the canonical identity sentence.",
    category: "profiles",
    priority: "now",
    impact: "high",
    effort: "small",
    status: "backlog",
  },
  {
    title: "Add Book schema for published titles",
    description: "Mark up each book with Book/Product JSON-LD and author link.",
    category: "books",
    priority: "next",
    impact: "high",
    effort: "medium",
    status: "backlog",
  },
  {
    title: "Claim & optimise Amazon Author Central",
    description: "Complete the author profile and link all titles.",
    category: "profiles",
    priority: "next",
    impact: "high",
    effort: "small",
    status: "backlog",
  },
  {
    title: "Produce a press & media kit page",
    description: "Bios, headshots and fast facts for journalists and events.",
    category: "press",
    priority: "next",
    impact: "medium",
    effort: "medium",
    status: "backlog",
  },
  {
    title: "Strengthen Google Knowledge Panel signals",
    description:
      "Consistent entity signals across owned and third-party sources.",
    category: "search_visibility",
    priority: "next",
    impact: "high",
    effort: "large",
    status: "backlog",
  },
  {
    title: "Add Podcast & PodcastEpisode schema",
    description: "Mark up the podcast show and episodes with JSON-LD.",
    category: "podcast",
    priority: "later",
    impact: "medium",
    effort: "medium",
    status: "backlog",
  },
  {
    title: "Add VideoObject schema to key videos",
    description: "Structured data for flagship YouTube and interview videos.",
    category: "video",
    priority: "later",
    impact: "medium",
    effort: "medium",
    status: "backlog",
  },
  {
    title: "Track AI assistant answers",
    description:
      "Regularly snapshot ChatGPT, Gemini and Perplexity answers about the entity.",
    category: "ai_visibility",
    priority: "later",
    impact: "medium",
    effort: "small",
    status: "backlog",
  },
  {
    title: "Clean up outdated & duplicate profiles",
    description: "Remove or correct stale directory and social listings.",
    category: "cleanup",
    priority: "someday",
    impact: "low",
    effort: "medium",
    status: "backlog",
  },
];

/**
 * Seed list for the `schema_items` checklist — one row per structured-data
 * type we care about, tracking implementation status.
 */
export const schemaSeedValues: NewSchemaItem[] = [
  {
    schemaType: "person",
    status: "planned",
    notes: "Highest priority — the canonical Person entity.",
  },
  { schemaType: "website", status: "planned" },
  { schemaType: "organization", status: "missing" },
  { schemaType: "book", status: "missing" },
  { schemaType: "article", status: "missing" },
  { schemaType: "podcast", status: "missing" },
  { schemaType: "video_object", status: "missing" },
  { schemaType: "breadcrumb_list", status: "missing" },
  { schemaType: "faq_page", status: "missing" },
];
