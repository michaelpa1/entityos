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
  "youtube_channel",
  "youtube_video",
  "article",
  "interview",
  "speaking_event",
  "professional_profile",
  "social_profile",
  "press",
  "company_page",
  "product",
  "photography",
  "music",
  "other",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "active",
  "incomplete",
  "outdated",
  "broken",
  "needs_review",
]);

export const ownershipTypeEnum = pgEnum("ownership_type", [
  "owned",
  "employer",
  "earned",
  "third_party",
  "social",
  "directory",
]);

/**
 * Asset-level entity role — how an asset functions within the entity graph.
 * Distinct from the claims-level `entity_role` (a person's roles), which is
 * intentionally left unchanged below.
 */
export const assetEntityRoleEnum = pgEnum("asset_entity_role", [
  "primary_canonical",
  "supporting",
  "evidence",
  "weak_signal",
  "outdated",
]);

// What kind of claim this is (spec-defined).
export const claimTypeEnum = pgEnum("claim_type", [
  "identity",
  "role",
  "credential",
  "product",
  "book",
  "speaking",
  "media",
  "award",
  "location",
  "employer",
  "expertise",
  "other",
]);

// How confident we are the claim is true and defensible.
export const claimConfidenceEnum = pgEnum("claim_confidence", [
  "strong",
  "moderate",
  "weak",
  "unsupported",
  "disputed",
]);

// How important the claim is for the public-facing entity.
export const publicImportanceEnum = pgEnum("public_importance", [
  "high",
  "medium",
  "low",
]);

export const evidenceStrengthEnum = pgEnum("evidence_strength", [
  "strong",
  "moderate",
  "weak",
]);

export const evidenceStatusEnum = pgEnum("evidence_status", [
  "valid",
  "incomplete",
  "outdated",
  "broken",
  "incorrect",
]);

export const evidenceSourceTypeEnum = pgEnum("evidence_source_type", [
  "official",
  "employer",
  "media",
  "podcast",
  "video",
  "book_retailer",
  "directory",
  "social",
  "search_result",
  "ai_response",
  "other",
]);

export const searchEngineEnum = pgEnum("search_engine", [
  "google",
  "bing",
  "other",
]);

export const deviceTypeEnum = pgEnum("device_type", ["desktop", "mobile"]);

export const aiProviderEnum = pgEnum("ai_provider", [
  "chatgpt",
  "gemini",
  "perplexity",
  "claude",
  "other",
]);

export const schemaTypeEnum = pgEnum("schema_type", [
  "person",
  "book",
  "podcast",
  "podcast_episode",
  "video_object",
  "article",
  "organization",
  "website",
  "breadcrumb_list",
  "faq_page",
  "image_object",
  "event",
  "course",
  "other",
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

// Priority is a time-horizon bucket (spec: now / next / later / someday).
export const roadmapPriorityEnum = pgEnum("roadmap_priority", [
  "now",
  "next",
  "later",
  "someday",
]);

export const roadmapCategoryEnum = pgEnum("roadmap_category", [
  "identity",
  "website",
  "schema",
  "books",
  "podcast",
  "video",
  "press",
  "speaking",
  "profiles",
  "ai_visibility",
  "search_visibility",
  "evidence",
  "cleanup",
  "other",
]);

export const roadmapEffortEnum = pgEnum("roadmap_effort", [
  "small",
  "medium",
  "large",
]);

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
  entityRole: assetEntityRoleEnum("entity_role"),
  authorityScore: integer("authority_score"),
  consistencyScore: integer("consistency_score"),
  notes: text("notes"),
  lastReviewed: timestamp("last_reviewed"),
  ...timestamps,
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  claimText: text("claim_text").notNull(),
  claimType: claimTypeEnum("claim_type").notNull().default("other"),
  confidence: claimConfidenceEnum("confidence").notNull().default("moderate"),
  publicImportance: publicImportanceEnum("public_importance")
    .notNull()
    .default("medium"),
  shouldBePublic: boolean("should_be_public").notNull().default(true),
  notes: text("notes"),
  ...timestamps,
});

export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sourceUrl: text("source_url"),
  sourceType: evidenceSourceTypeEnum("source_type").notNull().default("other"),
  evidenceStrength: evidenceStrengthEnum("evidence_strength")
    .notNull()
    .default("moderate"),
  evidenceStatus: evidenceStatusEnum("evidence_status")
    .notNull()
    .default("valid"),
  quoteOrSummary: text("quote_or_summary"),
  datePublished: timestamp("date_published"),
  claimId: integer("claim_id").references(() => claims.id),
  assetId: integer("asset_id").references(() => assets.id),
  notes: text("notes"),
  ...timestamps,
});

export const searchSnapshots = pgTable("search_snapshots", {
  id: serial("id").primaryKey(),
  searchEngine: searchEngineEnum("search_engine").notNull().default("google"),
  query: text("query").notNull(),
  location: text("location"),
  device: deviceTypeEnum("device_type").notNull().default("desktop"),
  snapshotDate: timestamp("snapshot_date"),
  hasKnowledgePanel: boolean("has_knowledge_panel").notNull().default(false),
  hasAiOverview: boolean("has_ai_overview").notNull().default(false),
  topResultUrl: text("top_result_url"),
  topResultTitle: text("top_result_title"),
  observedSummary: text("observed_summary"),
  screenshotUrl: text("screenshot_url"),
  notes: text("notes"),
  ...timestamps,
});

export const aiSnapshots = pgTable("ai_snapshots", {
  id: serial("id").primaryKey(),
  provider: aiProviderEnum("provider").notNull().default("chatgpt"),
  prompt: text("prompt").notNull(),
  responseSummary: text("response_summary"),
  fullResponse: text("full_response"),
  confidenceScore: integer("confidence_score"),
  snapshotDate: timestamp("snapshot_date"),
  notes: text("notes"),
  ...timestamps,
});

export const schemaItems = pgTable("schema_items", {
  id: serial("id").primaryKey(),
  schemaType: schemaTypeEnum("schema_type").notNull(),
  status: schemaStatusEnum("status").notNull().default("missing"),
  relatedAssetId: integer("related_asset_id").references(() => assets.id),
  validationUrl: text("validation_url"),
  notes: text("notes"),
  ...timestamps,
});

export const roadmapItems = pgTable("roadmap_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: roadmapCategoryEnum("category").notNull().default("other"),
  priority: roadmapPriorityEnum("priority").notNull().default("next"),
  impact: impactLevelEnum("impact").notNull().default("medium"),
  effort: roadmapEffortEnum("effort").notNull().default("medium"),
  status: roadmapStatusEnum("status").notNull().default("backlog"),
  dueDate: timestamp("due_date"),
  relatedAssetId: integer("related_asset_id").references(() => assets.id),
  relatedClaimId: integer("related_claim_id").references(() => claims.id),
  notes: text("notes"),
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
