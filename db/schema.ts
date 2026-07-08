import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Entity OS — Phase 1 database schema (Drizzle ORM + Neon Postgres).
 *
 * Enum values are snake_case. Where the spec explicitly lists values we match
 * them; `ownership_type` and `entity_role` are INFERRED (not explicit in the
 * spec) and use sensible defaults.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const assetTypeEnum = pgEnum("asset_type", [
  "website",
  "book",
  "podcast",
  "podcast_episode",
  "youtube",
  "video",
  "interview",
  "article",
  "speaking_event",
  "professional_profile",
  "company_page",
  "ai_product",
  "photography",
  "music",
  "advisory",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "active",
  "broken",
  "planned",
  "archived",
]);

// INFERRED — not explicit in the spec.
export const ownershipTypeEnum = pgEnum("ownership_type", [
  "owned",
  "controlled",
  "affiliated",
  "third_party",
]);

// INFERRED — derived from the claims list in the spec.
export const entityRoleEnum = pgEnum("entity_role", [
  "author",
  "product_manager",
  "speaker",
  "photographer",
  "ai_product_builder",
  "founder",
  "advisor",
]);

export const confidenceLevelEnum = pgEnum("confidence_level", [
  "low",
  "medium",
  "high",
]);

export const importanceLevelEnum = pgEnum("importance_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const evidenceStrengthEnum = pgEnum("evidence_strength", [
  "weak",
  "moderate",
  "strong",
]);

export const evidenceSourceTypeEnum = pgEnum("evidence_source_type", [
  "website_page",
  "podcast_interview",
  "youtube_appearance",
  "employer_page",
  "media_article",
  "conference_listing",
  "book_retailer",
  "ai_response",
]);

export const searchEngineEnum = pgEnum("search_engine", [
  "google",
  "bing",
  "duckduckgo",
]);

export const deviceTypeEnum = pgEnum("device_type", ["desktop", "mobile"]);

export const aiProviderEnum = pgEnum("ai_provider", [
  "chatgpt",
  "gemini",
  "perplexity",
  "claude",
]);

export const schemaTypeEnum = pgEnum("schema_type", [
  "person",
  "book",
  "podcast",
  "podcast_episode",
  "article",
  "video_object",
  "faq_page",
  "organization",
  "website",
  "breadcrumb",
  "image_object",
  "event",
  "course",
]);

export const schemaStatusEnum = pgEnum("schema_status", [
  "missing",
  "planned",
  "implemented",
  "validated",
  "broken",
]);

export const roadmapStatusEnum = pgEnum("roadmap_status", [
  "backlog",
  "in_progress",
  "blocked",
  "done",
]);

export const priorityLevelEnum = pgEnum("priority_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const effortLevelEnum = pgEnum("effort_level", ["low", "medium", "high"]);

export const impactLevelEnum = pgEnum("impact_level", ["low", "medium", "high"]);

// ---------------------------------------------------------------------------
// Shared timestamp columns (every table includes these + a serial id)
// ---------------------------------------------------------------------------

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const identityProfile = pgTable("identity_profile", {
  id: serial("id").primaryKey(),
  canonicalName: text("canonical_name").notNull(),
  preferredShortName: text("preferred_short_name"),
  primaryTitle: text("primary_title"),
  canonicalIdentitySentence: text("canonical_identity_sentence"),
  shortBio25: text("short_bio_25"),
  shortBio50: text("short_bio_50"),
  bio100: text("bio_100"),
  bio250: text("bio_250"),
  mediaBio500: text("media_bio_500"),
  canonicalHeadshotUrl: text("canonical_headshot_url"),
  canonicalWebsiteUrl: text("canonical_website_url"),
  location: text("location"),
  ...timestamps,
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  assetType: assetTypeEnum("asset_type").notNull(),
  url: text("url"),
  status: assetStatusEnum("status").notNull().default("active"),
  ownershipType: ownershipTypeEnum("ownership_type"),
  authorityScore: integer("authority_score"),
  consistencyScore: integer("consistency_score"),
  notes: text("notes"),
  lastReviewed: timestamp("last_reviewed"),
  ...timestamps,
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  statement: text("statement").notNull(),
  entityRole: entityRoleEnum("entity_role"),
  confidence: confidenceLevelEnum("confidence").notNull().default("medium"),
  importance: importanceLevelEnum("importance").notNull().default("medium"),
  notes: text("notes"),
  ...timestamps,
});

export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  sourceUrl: text("source_url"),
  sourceType: evidenceSourceTypeEnum("source_type"),
  strength: evidenceStrengthEnum("strength"),
  summary: text("summary"),
  evidenceDate: timestamp("evidence_date"),
  notes: text("notes"),
  claimId: integer("claim_id").references(() => claims.id),
  assetId: integer("asset_id").references(() => assets.id),
  ...timestamps,
});

export const searchSnapshots = pgTable("search_snapshots", {
  id: serial("id").primaryKey(),
  searchEngine: searchEngineEnum("search_engine").notNull(),
  query: text("query").notNull(),
  snapshotDate: timestamp("snapshot_date"),
  device: deviceTypeEnum("device"),
  location: text("location"),
  topResult: text("top_result"),
  knowledgePanel: boolean("knowledge_panel").default(false),
  aiOverview: boolean("ai_overview").default(false),
  screenshotUrl: text("screenshot_url"),
  notes: text("notes"),
  ...timestamps,
});

export const aiSnapshots = pgTable("ai_snapshots", {
  id: serial("id").primaryKey(),
  provider: aiProviderEnum("provider").notNull(),
  prompt: text("prompt").notNull(),
  summary: text("summary"),
  fullResponse: text("full_response"),
  confidenceScore: integer("confidence_score"),
  snapshotDate: timestamp("snapshot_date"),
  ...timestamps,
});

export const schemaItems = pgTable("schema_items", {
  id: serial("id").primaryKey(),
  schemaType: schemaTypeEnum("schema_type").notNull(),
  status: schemaStatusEnum("status").notNull().default("missing"),
  notes: text("notes"),
  url: text("url"),
  ...timestamps,
});

export const roadmapItems = pgTable("roadmap_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  priority: priorityLevelEnum("priority").notNull().default("medium"),
  impact: impactLevelEnum("impact").notNull().default("medium"),
  effort: effortLevelEnum("effort").notNull().default("medium"),
  status: roadmapStatusEnum("status").notNull().default("backlog"),
  relatedAssetId: integer("related_asset_id").references(() => assets.id),
  relatedClaimId: integer("related_claim_id").references(() => claims.id),
  ...timestamps,
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Inferred insert/select types (handy for later phases; zod stays available)
// ---------------------------------------------------------------------------

export type IdentityProfile = typeof identityProfile.$inferSelect;
export type NewIdentityProfile = typeof identityProfile.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;
export type Evidence = typeof evidence.$inferSelect;
export type NewEvidence = typeof evidence.$inferInsert;
export type SearchSnapshot = typeof searchSnapshots.$inferSelect;
export type NewSearchSnapshot = typeof searchSnapshots.$inferInsert;
export type AiSnapshot = typeof aiSnapshots.$inferSelect;
export type NewAiSnapshot = typeof aiSnapshots.$inferInsert;
export type SchemaItem = typeof schemaItems.$inferSelect;
export type NewSchemaItem = typeof schemaItems.$inferInsert;
export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type NewRoadmapItem = typeof roadmapItems.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
