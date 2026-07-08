import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { assets, schemaItems, type SchemaItem } from "@/db/schema";

export type SchemaItemWithAsset = SchemaItem & {
  assetName: string | null;
};

const linkColumns = {
  schemaItem: schemaItems,
  assetName: assets.name,
};

function withAsset(row: {
  schemaItem: SchemaItem;
  assetName: string | null;
}): SchemaItemWithAsset {
  return { ...row.schemaItem, assetName: row.assetName };
}

export async function getSchemaItems(): Promise<SchemaItemWithAsset[]> {
  const rows = await db
    .select(linkColumns)
    .from(schemaItems)
    .leftJoin(assets, eq(schemaItems.relatedAssetId, assets.id))
    .orderBy(asc(schemaItems.id));

  return rows.map(withAsset);
}

export async function getAssetOptions(): Promise<
  { id: number; name: string }[]
> {
  return db
    .select({ id: assets.id, name: assets.name })
    .from(assets)
    .orderBy(asc(assets.name));
}
