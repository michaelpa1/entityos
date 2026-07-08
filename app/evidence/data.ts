import { and, asc, desc, eq, inArray, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { assets, claims, evidence, type Evidence } from "@/db/schema";
import type { EvidenceStatus, EvidenceStrength, SourceType } from "./schema";

export type EvidenceFilters = {
  sourceType?: SourceType[];
  evidenceStrength?: EvidenceStrength[];
  evidenceStatus?: EvidenceStatus[];
};

export type EvidenceWithLinks = Evidence & {
  claimText: string | null;
  assetName: string | null;
};

const linkColumns = {
  evidence: evidence,
  claimText: claims.claimText,
  assetName: assets.name,
};

function withLinks(row: {
  evidence: Evidence;
  claimText: string | null;
  assetName: string | null;
}): EvidenceWithLinks {
  return { ...row.evidence, claimText: row.claimText, assetName: row.assetName };
}

export async function getEvidenceList(
  filters: EvidenceFilters = {},
): Promise<EvidenceWithLinks[]> {
  const conditions: SQL[] = [];

  if (filters.sourceType?.length) {
    conditions.push(inArray(evidence.sourceType, filters.sourceType));
  }
  if (filters.evidenceStrength?.length) {
    conditions.push(inArray(evidence.evidenceStrength, filters.evidenceStrength));
  }
  if (filters.evidenceStatus?.length) {
    conditions.push(inArray(evidence.evidenceStatus, filters.evidenceStatus));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select(linkColumns)
    .from(evidence)
    .leftJoin(claims, eq(evidence.claimId, claims.id))
    .leftJoin(assets, eq(evidence.assetId, assets.id))
    .where(where)
    .orderBy(desc(evidence.id));

  return rows.map(withLinks);
}

export async function getEvidenceItem(
  id: number,
): Promise<EvidenceWithLinks | null> {
  if (!Number.isInteger(id)) return null;
  const rows = await db
    .select(linkColumns)
    .from(evidence)
    .leftJoin(claims, eq(evidence.claimId, claims.id))
    .leftJoin(assets, eq(evidence.assetId, assets.id))
    .where(eq(evidence.id, id))
    .limit(1);
  return rows[0] ? withLinks(rows[0]) : null;
}

/** Evidence rows that reference a given claim (for the claim detail view). */
export async function getEvidenceForClaim(
  claimId: number,
): Promise<Evidence[]> {
  if (!Number.isInteger(claimId)) return [];
  return db
    .select()
    .from(evidence)
    .where(eq(evidence.claimId, claimId))
    .orderBy(asc(evidence.id));
}

/** Evidence rows that reference a given asset (for the asset detail view). */
export async function getEvidenceForAsset(
  assetId: number,
): Promise<Evidence[]> {
  if (!Number.isInteger(assetId)) return [];
  return db
    .select()
    .from(evidence)
    .where(eq(evidence.assetId, assetId))
    .orderBy(asc(evidence.id));
}

export async function getAssetOptions(): Promise<
  { id: number; name: string }[]
> {
  return db
    .select({ id: assets.id, name: assets.name })
    .from(assets)
    .orderBy(asc(assets.name));
}
