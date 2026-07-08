"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { evidence } from "@/db/schema";
import { evidenceFormSchema, type EvidenceFormValues } from "./schema";

export type EvidenceActionResult = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof EvidenceFormValues, string>>;
};

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toRecord(data: EvidenceFormValues) {
  return {
    title: data.title.trim(),
    sourceUrl: emptyToNull(data.sourceUrl),
    sourceType: data.sourceType,
    evidenceStrength: data.evidenceStrength,
    evidenceStatus: data.evidenceStatus,
    quoteOrSummary: emptyToNull(data.quoteOrSummary),
    datePublished: data.datePublished ? new Date(data.datePublished) : null,
    claimId: data.claimId === "" ? null : Number(data.claimId),
    assetId: data.assetId === "" ? null : Number(data.assetId),
    notes: emptyToNull(data.notes),
    updatedAt: new Date(),
  };
}

function validationError(
  values: EvidenceFormValues,
): EvidenceActionResult | null {
  const parsed = evidenceFormSchema.safeParse(values);
  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof EvidenceFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof EvidenceFormValues;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Some fields need attention.", fieldErrors };
}

export async function createEvidence(
  values: EvidenceFormValues,
): Promise<EvidenceActionResult> {
  const error = validationError(values);
  if (error) return error;

  const [row] = await db
    .insert(evidence)
    .values(toRecord(values))
    .returning({ id: evidence.id });

  revalidatePath("/evidence");
  redirect(`/evidence/${row.id}`);
}

export async function updateEvidence(
  id: number,
  values: EvidenceFormValues,
): Promise<EvidenceActionResult> {
  if (!Number.isInteger(id)) {
    return { ok: false, message: "Invalid evidence id." };
  }

  const error = validationError(values);
  if (error) return error;

  await db.update(evidence).set(toRecord(values)).where(eq(evidence.id, id));

  revalidatePath("/evidence");
  revalidatePath(`/evidence/${id}`);
  redirect(`/evidence/${id}`);
}

export async function deleteEvidence(id: number): Promise<void> {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid evidence id.");
  }

  await db.delete(evidence).where(eq(evidence.id, id));

  revalidatePath("/evidence");
  redirect("/evidence");
}
