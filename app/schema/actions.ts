"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { schemaItems } from "@/db/schema";
import {
  schemaItemFormSchema,
  schemaStatusValues,
  type SchemaItemFormValues,
  type SchemaStatus,
} from "./schema";

export type SchemaActionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<keyof SchemaItemFormValues, string>>;
    };

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toRecord(data: SchemaItemFormValues) {
  return {
    schemaType: data.schemaType,
    status: data.status,
    relatedAssetId:
      data.relatedAssetId === "" ? null : Number(data.relatedAssetId),
    validationUrl: emptyToNull(data.validationUrl),
    notes: emptyToNull(data.notes),
    updatedAt: new Date(),
  };
}

function validationError(
  values: SchemaItemFormValues,
): SchemaActionResult | null {
  const parsed = schemaItemFormSchema.safeParse(values);
  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof SchemaItemFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof SchemaItemFormValues;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Some fields need attention.", fieldErrors };
}

export async function createSchemaItem(
  values: SchemaItemFormValues,
): Promise<SchemaActionResult> {
  const error = validationError(values);
  if (error) return error;

  await db.insert(schemaItems).values(toRecord(values));
  revalidatePath("/schema");
  return { ok: true };
}

export async function updateSchemaItem(
  id: number,
  values: SchemaItemFormValues,
): Promise<SchemaActionResult> {
  if (!Number.isInteger(id)) {
    return { ok: false, message: "Invalid schema item id." };
  }

  const error = validationError(values);
  if (error) return error;

  await db.update(schemaItems).set(toRecord(values)).where(eq(schemaItems.id, id));
  revalidatePath("/schema");
  return { ok: true };
}

/** Inline status change from the checklist table. */
export async function updateSchemaStatus(
  id: number,
  status: SchemaStatus,
): Promise<void> {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid schema item id.");
  }
  if (!schemaStatusValues.includes(status)) {
    throw new Error("Invalid status.");
  }

  await db
    .update(schemaItems)
    .set({ status, updatedAt: new Date() })
    .where(eq(schemaItems.id, id));
  revalidatePath("/schema");
}

export async function deleteSchemaItem(id: number): Promise<void> {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid schema item id.");
  }

  await db.delete(schemaItems).where(eq(schemaItems.id, id));
  revalidatePath("/schema");
}
