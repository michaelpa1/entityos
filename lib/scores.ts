import { and, desc, eq, gt, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  assets,
  claims,
  evidence,
  roadmapItems,
  schemaItems,
  settings,
} from "@/db/schema";

// Settings keys for manual visibility scores (default 50 until overridden).
export const SEARCH_VISIBILITY_KEY = "search_visibility_health";
export const AI_VISIBILITY_KEY = "ai_visibility_health";
const DEFAULT_MANUAL_SCORE = 50;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DashboardMetrics = {
  entityHealthScore: number;
  identityConsistency: number;
  evidenceCoverage: number;
  schemaHealth: number;
  searchVisibilityHealth: number;
  aiVisibilityHealth: number;
};

export type CountMap = Record<string, number>;

export type DashboardData = {
  metrics: DashboardMetrics;
  assetsSummary: {
    total: number;
    active: number;
    broken: number;
    outdated: number;
  };
  claimsSummary: {
    total: number;
    strong: number;
    moderate: number;
    weak: number;
    unsupported: number;
  };
  evidenceSummary: {
    total: number;
    strong: number;
    moderate: number;
    weak: number;
  };
  schemaStatus: CountMap;
  roadmapStatus: CountMap;
  sprintItems: { id: number; title: string; status: string }[];
  brokenHighAuthorityAssets: {
    id: number;
    name: string;
    authorityScore: number | null;
  }[];
  unsupportedHighClaims: { id: number; claimText: string }[];
  recentEvidence: {
    id: number;
    title: string;
    createdAt: Date;
  }[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function countBy<T extends string>(
  rows: { key: T | null }[],
  keys: readonly T[],
): CountMap {
  const counts: CountMap = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const row of rows) {
    if (row.key && row.key in counts) {
      counts[row.key]++;
    }
  }
  return counts;
}

async function getManualScore(
  key: string,
  defaultValue = DEFAULT_MANUAL_SCORE,
): Promise<number> {
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  const raw = rows[0]?.value;
  if (raw == null || raw.trim() === "") return defaultValue;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return defaultValue;
  return clampScore(parsed);
}

// ---------------------------------------------------------------------------
// Metric calculations
// ---------------------------------------------------------------------------

/** Average consistency_score across active assets. Returns 0 if none. */
export async function getIdentityConsistency(): Promise<number> {
  const rows = await db
    .select({ score: assets.consistencyScore })
    .from(assets)
    .where(eq(assets.status, "active"));

  if (rows.length === 0) return 0;

  const scores = rows
    .map((r) => r.score)
    .filter((s): s is number => s != null);

  if (scores.length === 0) return 0;
  return clampScore(average(scores));
}

/**
 * Percentage of high-importance claims that have at least one linked
 * evidence item with strength strong or moderate.
 */
export async function getEvidenceCoverage(): Promise<number> {
  const highClaims = await db
    .select({ id: claims.id })
    .from(claims)
    .where(eq(claims.publicImportance, "high"));

  if (highClaims.length === 0) return 0;

  const claimIds = highClaims.map((c) => c.id);

  const covered = await db
    .select({ claimId: evidence.claimId })
    .from(evidence)
    .where(
      and(
        inArray(evidence.claimId, claimIds),
        inArray(evidence.evidenceStrength, ["strong", "moderate"]),
      ),
    );

  const coveredIds = new Set(
    covered.map((e) => e.claimId).filter((id): id is number => id != null),
  );

  return clampScore((coveredIds.size / claimIds.length) * 100);
}

/** Percentage of schema items with status implemented or validated. */
export async function getSchemaHealth(): Promise<number> {
  const rows = await db
    .select({ status: schemaItems.status })
    .from(schemaItems);

  if (rows.length === 0) return 0;

  const healthy = rows.filter(
    (r) => r.status === "implemented" || r.status === "validated",
  ).length;

  return clampScore((healthy / rows.length) * 100);
}

export async function getSearchVisibilityHealth(): Promise<number> {
  return getManualScore(SEARCH_VISIBILITY_KEY);
}

export async function getAIVisibilityHealth(): Promise<number> {
  return getManualScore(AI_VISIBILITY_KEY);
}

/** Average of the five pillar scores (0–100). */
export function calculateEntityHealthScore(metrics: {
  identityConsistency: number;
  evidenceCoverage: number;
  schemaHealth: number;
  searchVisibilityHealth: number;
  aiVisibilityHealth: number;
}): number {
  return clampScore(
    average([
      metrics.identityConsistency,
      metrics.evidenceCoverage,
      metrics.schemaHealth,
      metrics.searchVisibilityHealth,
      metrics.aiVisibilityHealth,
    ]),
  );
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    identityConsistency,
    evidenceCoverage,
    schemaHealth,
    searchVisibilityHealth,
    aiVisibilityHealth,
  ] = await Promise.all([
    getIdentityConsistency(),
    getEvidenceCoverage(),
    getSchemaHealth(),
    getSearchVisibilityHealth(),
    getAIVisibilityHealth(),
  ]);

  const entityHealthScore = calculateEntityHealthScore({
    identityConsistency,
    evidenceCoverage,
    schemaHealth,
    searchVisibilityHealth,
    aiVisibilityHealth,
  });

  return {
    entityHealthScore,
    identityConsistency,
    evidenceCoverage,
    schemaHealth,
    searchVisibilityHealth,
    aiVisibilityHealth,
  };
}

// ---------------------------------------------------------------------------
// Dashboard aggregates + quick-access lists
// ---------------------------------------------------------------------------

export async function getDashboardData(): Promise<DashboardData> {
  const [
    metrics,
    assetRows,
    claimRows,
    evidenceRows,
    schemaRows,
    roadmapRows,
    sprintItems,
    brokenHighAuthorityAssets,
    unsupportedHighClaims,
    recentEvidence,
  ] = await Promise.all([
    getDashboardMetrics(),
    db.select({ status: assets.status }).from(assets),
    db.select({ confidence: claims.confidence }).from(claims),
    db.select({ strength: evidence.evidenceStrength }).from(evidence),
    db.select({ status: schemaItems.status }).from(schemaItems),
    db.select({ status: roadmapItems.status }).from(roadmapItems),
    db
      .select({
        id: roadmapItems.id,
        title: roadmapItems.title,
        status: roadmapItems.status,
      })
      .from(roadmapItems)
      .where(eq(roadmapItems.priority, "now"))
      .orderBy(roadmapItems.id)
      .limit(5),
    db
      .select({
        id: assets.id,
        name: assets.name,
        authorityScore: assets.authorityScore,
      })
      .from(assets)
      .where(and(eq(assets.status, "broken"), gt(assets.authorityScore, 50)))
      .orderBy(desc(assets.authorityScore))
      .limit(5),
    db
      .select({ id: claims.id, claimText: claims.claimText })
      .from(claims)
      .where(
        and(
          eq(claims.confidence, "unsupported"),
          eq(claims.publicImportance, "high"),
        ),
      )
      .limit(5),
    db
      .select({
        id: evidence.id,
        title: evidence.title,
        createdAt: evidence.createdAt,
      })
      .from(evidence)
      .orderBy(desc(evidence.createdAt))
      .limit(5),
  ]);

  const assetsSummary = {
    total: assetRows.length,
    active: assetRows.filter((r) => r.status === "active").length,
    broken: assetRows.filter((r) => r.status === "broken").length,
    outdated: assetRows.filter((r) => r.status === "outdated").length,
  };

  const claimsSummary = {
    total: claimRows.length,
    strong: claimRows.filter((r) => r.confidence === "strong").length,
    moderate: claimRows.filter((r) => r.confidence === "moderate").length,
    weak: claimRows.filter((r) => r.confidence === "weak").length,
    unsupported: claimRows.filter((r) => r.confidence === "unsupported")
      .length,
  };

  const evidenceSummary = {
    total: evidenceRows.length,
    strong: evidenceRows.filter((r) => r.strength === "strong").length,
    moderate: evidenceRows.filter((r) => r.strength === "moderate").length,
    weak: evidenceRows.filter((r) => r.strength === "weak").length,
  };

  const schemaStatus = countBy(
    schemaRows.map((r) => ({ key: r.status })),
    [
      "missing",
      "planned",
      "implemented",
      "validated",
      "broken",
    ] as const,
  );

  const roadmapStatus = countBy(
    roadmapRows.map((r) => ({ key: r.status })),
    ["backlog", "in_progress", "done"] as const,
  );

  return {
    metrics,
    assetsSummary,
    claimsSummary,
    evidenceSummary,
    schemaStatus,
    roadmapStatus,
    sprintItems,
    brokenHighAuthorityAssets,
    unsupportedHighClaims,
    recentEvidence,
  };
}
