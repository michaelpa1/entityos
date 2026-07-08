import { and, desc, eq, inArray, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { searchSnapshots, type SearchSnapshot } from "@/db/schema";
import type { SearchEngine } from "./schema";

export type SearchSnapshotFilters = {
  searchEngine?: SearchEngine[];
};

export async function getSearchSnapshots(
  filters: SearchSnapshotFilters = {},
): Promise<SearchSnapshot[]> {
  const conditions: SQL[] = [];

  if (filters.searchEngine?.length) {
    conditions.push(inArray(searchSnapshots.searchEngine, filters.searchEngine));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  return db
    .select()
    .from(searchSnapshots)
    .where(where)
    .orderBy(desc(searchSnapshots.snapshotDate), desc(searchSnapshots.id));
}

export async function getSearchSnapshot(
  id: number,
): Promise<SearchSnapshot | null> {
  if (!Number.isInteger(id)) return null;
  const rows = await db
    .select()
    .from(searchSnapshots)
    .where(eq(searchSnapshots.id, id))
    .limit(1);
  return rows[0] ?? null;
}
