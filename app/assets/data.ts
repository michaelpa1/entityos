import { and, asc, eq, inArray, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { assets, type Asset } from "@/db/schema";
import type { AssetStatus, AssetType, OwnershipType } from "./schema";

export type AssetFilters = {
  assetType?: AssetType[];
  ownershipType?: OwnershipType[];
  status?: AssetStatus[];
};

export async function getAssets(
  filters: AssetFilters = {},
): Promise<Asset[]> {
  const conditions: SQL[] = [];

  if (filters.assetType?.length) {
    conditions.push(inArray(assets.assetType, filters.assetType));
  }
  if (filters.ownershipType?.length) {
    conditions.push(inArray(assets.ownershipType, filters.ownershipType));
  }
  if (filters.status?.length) {
    conditions.push(inArray(assets.status, filters.status));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  return db.select().from(assets).where(where).orderBy(asc(assets.name));
}

export async function getAsset(id: number): Promise<Asset | null> {
  if (!Number.isInteger(id)) return null;
  const rows = await db
    .select()
    .from(assets)
    .where(eq(assets.id, id))
    .limit(1);
  return rows[0] ?? null;
}
