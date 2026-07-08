"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { claims } from "@/db/schema";
import { claimFormSchema, type ClaimFormValues } from "./schema";

export type ClaimActionResult = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof ClaimFormValues, string>>;
};

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toRecord(data: ClaimFormValues) {
  return {
    claimText: data.claimText.trim(),
    claimType: data.claimType,
    confidence: data.confidence,
    publicImportance: data.publicImportance,
    shouldBePublic: data.shouldBePublic,
    notes: emptyToNull(data.notes),
    updatedAt: new Date(),
  };
}

function validationError(values: ClaimFormValues): ClaimActionResult | null {
  const parsed = claimFormSchema.safeParse(values);
  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof ClaimFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof ClaimFormValues;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Some fields need attention.", fieldErrors };
}

export async function createClaim(
  values: ClaimFormValues,
): Promise<ClaimActionResult> {
  const error = validationError(values);
  if (error) return error;

  const [row] = await db
    .insert(claims)
    .values(toRecord(values))
    .returning({ id: claims.id });

  revalidatePath("/claims");
  redirect(`/claims/${row.id}`);
}

export async function updateClaim(
  id: number,
  values: ClaimFormValues,
): Promise<ClaimActionResult> {
  if (!Number.isInteger(id)) {
    return { ok: false, message: "Invalid claim id." };
  }

  const error = validationError(values);
  if (error) return error;

  await db.update(claims).set(toRecord(values)).where(eq(claims.id, id));

  revalidatePath("/claims");
  revalidatePath(`/claims/${id}`);
  redirect(`/claims/${id}`);
}

export async function deleteClaim(id: number): Promise<void> {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid claim id.");
  }

  await db.delete(claims).where(eq(claims.id, id));

  revalidatePath("/claims");
  redirect("/claims");
}
