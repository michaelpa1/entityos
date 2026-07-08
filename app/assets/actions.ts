"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { assets } from "@/db/schema";
import { assetFormSchema, type AssetFormValues } from "./schema";

export type AssetActionResult = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof AssetFormValues, string>>;
};

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function scoreToNumber(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

function toRecord(data: AssetFormValues) {
  return {
    name: data.name.trim(),
    assetType: data.assetType,
    url: emptyToNull(data.url),
    ownershipType: data.ownershipType === "" ? null : data.ownershipType,
    entityRole: data.entityRole === "" ? null : data.entityRole,
    status: data.status,
    authorityScore: scoreToNumber(data.authorityScore),
    consistencyScore: scoreToNumber(data.consistencyScore),
    notes: emptyToNull(data.notes),
    updatedAt: new Date(),
  };
}

function validationError(
  values: AssetFormValues,
): AssetActionResult | null {
  const parsed = assetFormSchema.safeParse(values);
  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof AssetFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof AssetFormValues;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Some fields need attention.", fieldErrors };
}

export async function createAsset(
  values: AssetFormValues,
): Promise<AssetActionResult> {
  const error = validationError(values);
  if (error) return error;

  const [row] = await db
    .insert(assets)
    .values(toRecord(values))
    .returning({ id: assets.id });

  revalidatePath("/assets");
  redirect(`/assets/${row.id}`);
}

export async function updateAsset(
  id: number,
  values: AssetFormValues,
): Promise<AssetActionResult> {
  if (!Number.isInteger(id)) {
    return { ok: false, message: "Invalid asset id." };
  }

  const error = validationError(values);
  if (error) return error;

  await db.update(assets).set(toRecord(values)).where(eq(assets.id, id));

  revalidatePath("/assets");
  revalidatePath(`/assets/${id}`);
  redirect(`/assets/${id}`);
}

export async function deleteAsset(id: number): Promise<void> {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid asset id.");
  }

  await db.delete(assets).where(eq(assets.id, id));

  revalidatePath("/assets");
  redirect("/assets");
}
