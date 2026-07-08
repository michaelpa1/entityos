import { and, asc, eq, inArray, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { assets, claims, roadmapItems, type RoadmapItem } from "@/db/schema";
import type { Category, Priority, Status } from "./schema";

export type RoadmapFilters = {
  priority?: Priority[];
  status?: Status[];
  category?: Category[];
};

export type RoadmapItemWithLinks = RoadmapItem & {
  assetName: string | null;
  claimText: string | null;
};

const linkColumns = {
  roadmapItem: roadmapItems,
  assetName: assets.name,
  claimText: claims.claimText,
};

function withLinks(row: {
  roadmapItem: RoadmapItem;
  assetName: string | null;
  claimText: string | null;
}): RoadmapItemWithLinks {
  return {
    ...row.roadmapItem,
    assetName: row.assetName,
    claimText: row.claimText,
  };
}

// Sort priority buckets in a meaningful order (now first, someday last).
const priorityRank: Record<Priority, number> = {
  now: 0,
  next: 1,
  later: 2,
  someday: 3,
};

export async function getRoadmapItems(
  filters: RoadmapFilters = {},
): Promise<RoadmapItemWithLinks[]> {
  const conditions: SQL[] = [];

  if (filters.priority?.length) {
    conditions.push(inArray(roadmapItems.priority, filters.priority));
  }
  if (filters.status?.length) {
    conditions.push(inArray(roadmapItems.status, filters.status));
  }
  if (filters.category?.length) {
    conditions.push(inArray(roadmapItems.category, filters.category));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select(linkColumns)
    .from(roadmapItems)
    .leftJoin(assets, eq(roadmapItems.relatedAssetId, assets.id))
    .leftJoin(claims, eq(roadmapItems.relatedClaimId, claims.id))
    .where(where)
    .orderBy(asc(roadmapItems.id));

  return rows
    .map(withLinks)
    .sort(
      (a, b) =>
        priorityRank[a.priority as Priority] -
        priorityRank[b.priority as Priority],
    );
}

export async function getRoadmapItem(
  id: number,
): Promise<RoadmapItemWithLinks | null> {
  if (!Number.isInteger(id)) return null;
  const rows = await db
    .select(linkColumns)
    .from(roadmapItems)
    .leftJoin(assets, eq(roadmapItems.relatedAssetId, assets.id))
    .leftJoin(claims, eq(roadmapItems.relatedClaimId, claims.id))
    .where(eq(roadmapItems.id, id))
    .limit(1);
  return rows[0] ? withLinks(rows[0]) : null;
}

export async function getAssetOptions(): Promise<
  { id: number; name: string }[]
> {
  return db
    .select({ id: assets.id, name: assets.name })
    .from(assets)
    .orderBy(asc(assets.name));
}

export async function getClaimOptions(): Promise<
  { id: number; claimText: string }[]
> {
  return db
    .select({ id: claims.id, claimText: claims.claimText })
    .from(claims)
    .orderBy(asc(claims.id));
}
