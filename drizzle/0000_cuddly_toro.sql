CREATE TYPE "public"."ai_provider" AS ENUM('chatgpt', 'gemini', 'perplexity', 'claude');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('active', 'broken', 'planned', 'archived');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('website', 'book', 'podcast', 'podcast_episode', 'youtube', 'video', 'interview', 'article', 'speaking_event', 'professional_profile', 'company_page', 'ai_product', 'photography', 'music', 'advisory');--> statement-breakpoint
CREATE TYPE "public"."confidence_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('desktop', 'mobile');--> statement-breakpoint
CREATE TYPE "public"."effort_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."entity_role" AS ENUM('author', 'product_manager', 'speaker', 'photographer', 'ai_product_builder', 'founder', 'advisor');--> statement-breakpoint
CREATE TYPE "public"."evidence_source_type" AS ENUM('website_page', 'podcast_interview', 'youtube_appearance', 'employer_page', 'media_article', 'conference_listing', 'book_retailer', 'ai_response');--> statement-breakpoint
CREATE TYPE "public"."evidence_strength" AS ENUM('weak', 'moderate', 'strong');--> statement-breakpoint
CREATE TYPE "public"."impact_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."importance_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."ownership_type" AS ENUM('owned', 'controlled', 'affiliated', 'third_party');--> statement-breakpoint
CREATE TYPE "public"."priority_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."roadmap_status" AS ENUM('backlog', 'in_progress', 'blocked', 'done');--> statement-breakpoint
CREATE TYPE "public"."schema_status" AS ENUM('missing', 'planned', 'implemented', 'validated', 'broken');--> statement-breakpoint
CREATE TYPE "public"."schema_type" AS ENUM('person', 'book', 'podcast', 'podcast_episode', 'article', 'video_object', 'faq_page', 'organization', 'website', 'breadcrumb', 'image_object', 'event', 'course');--> statement-breakpoint
CREATE TYPE "public"."search_engine" AS ENUM('google', 'bing', 'duckduckgo');--> statement-breakpoint
CREATE TABLE "ai_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" "ai_provider" NOT NULL,
	"prompt" text NOT NULL,
	"summary" text,
	"full_response" text,
	"confidence_score" integer,
	"snapshot_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"url" text,
	"status" "asset_status" DEFAULT 'active' NOT NULL,
	"ownership_type" "ownership_type",
	"authority_score" integer,
	"consistency_score" integer,
	"notes" text,
	"last_reviewed" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"statement" text NOT NULL,
	"entity_role" "entity_role",
	"confidence" "confidence_level" DEFAULT 'medium' NOT NULL,
	"importance" "importance_level" DEFAULT 'medium' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_url" text,
	"source_type" "evidence_source_type",
	"strength" "evidence_strength",
	"summary" text,
	"evidence_date" timestamp,
	"notes" text,
	"claim_id" integer,
	"asset_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"canonical_name" text NOT NULL,
	"preferred_name" text,
	"primary_title" text,
	"canonical_identity_sentence" text,
	"bio_25" text,
	"bio_50" text,
	"bio_100" text,
	"bio_250" text,
	"media_bio_500" text,
	"canonical_headshot_url" text,
	"website" text,
	"location" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"priority" "priority_level" DEFAULT 'medium' NOT NULL,
	"impact" "impact_level" DEFAULT 'medium' NOT NULL,
	"effort" "effort_level" DEFAULT 'medium' NOT NULL,
	"status" "roadmap_status" DEFAULT 'backlog' NOT NULL,
	"related_asset_id" integer,
	"related_claim_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schema_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"schema_type" "schema_type" NOT NULL,
	"status" "schema_status" DEFAULT 'missing' NOT NULL,
	"notes" text,
	"url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"search_engine" "search_engine" NOT NULL,
	"query" text NOT NULL,
	"snapshot_date" timestamp,
	"device" "device_type",
	"location" text,
	"top_result" text,
	"knowledge_panel" boolean DEFAULT false,
	"ai_overview" boolean DEFAULT false,
	"screenshot_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_related_asset_id_assets_id_fk" FOREIGN KEY ("related_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_related_claim_id_claims_id_fk" FOREIGN KEY ("related_claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;