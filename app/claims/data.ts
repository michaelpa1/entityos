import { and, asc, eq, inArray, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { claims, evidence, type Claim } from "@/db/schema";
import type { ClaimType, Confidence, PublicImportance } from "./schema";

export type ClaimFilters = {
  claimType?: ClaimType[];
  confidence?: Confidence[];
  publicImportance?: PublicImportance[];
};

export type ClaimWithCount = Claim & { evidenceCount: number };

export async function getClaims(
  filters: ClaimFilters = {},
): Promise<ClaimWithCount[]> {
  const conditions: SQL[] = [];

  if (filters.claimType?.length) {
    conditions.push(inArray(claims.claimType, filters.claimType));
  }
  if (filters.confidence?.length) {
    conditions.push(inArray(claims.confidence, filters.confidence));
  }
  if (filters.publicImportance?.length) {
    conditions.push(inArray(claims.publicImportance, filters.publicImportance));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      claim: claims,
      evidenceCount: sql<number>`count(${evidence.id})`.mapWith(Number),
    })
    .from(claims)
    .leftJoin(evidence, eq(evidence.claimId, claims.id))
    .where(where)
    .groupBy(claims.id)
    .orderBy(asc(claims.id));

  return rows.map((row) => ({ ...row.claim, evidenceCount: row.evidenceCount }));
}

export async function getClaim(id: number): Promise<Claim | null> {
  if (!Number.isInteger(id)) return null;
  const rows = await db
    .select()
    .from(claims)
    .where(eq(claims.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Lightweight options for the evidence form's "linked claim" select. */
export async function getClaimOptions(): Promise<
  { id: number; claimText: string }[]
> {
  return db
    .select({ id: claims.id, claimText: claims.claimText })
    .from(claims)
    .orderBy(asc(claims.claimText));
}
