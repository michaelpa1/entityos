import { and, desc, eq, inArray, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { aiSnapshots, type AiSnapshot } from "@/db/schema";
import type { AiProvider } from "./schema";

export type AiSnapshotFilters = {
  provider?: AiProvider[];
};

export async function getAiSnapshots(
  filters: AiSnapshotFilters = {},
): Promise<AiSnapshot[]> {
  const conditions: SQL[] = [];

  if (filters.provider?.length) {
    conditions.push(inArray(aiSnapshots.provider, filters.provider));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  return db
    .select()
    .from(aiSnapshots)
    .where(where)
    .orderBy(desc(aiSnapshots.snapshotDate), desc(aiSnapshots.id));
}

export async function getAiSnapshot(id: number): Promise<AiSnapshot | null> {
  if (!Number.isInteger(id)) return null;
  const rows = await db
    .select()
    .from(aiSnapshots)
    .where(eq(aiSnapshots.id, id))
    .limit(1);
  return rows[0] ?? null;
}
