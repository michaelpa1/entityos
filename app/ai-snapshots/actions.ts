"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { aiSnapshots } from "@/db/schema";
import { aiSnapshotFormSchema, type AiSnapshotFormValues } from "./schema";

export type AiSnapshotActionResult = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof AiSnapshotFormValues, string>>;
};

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toRecord(data: AiSnapshotFormValues) {
  return {
    provider: data.provider,
    prompt: data.prompt.trim(),
    responseSummary: emptyToNull(data.responseSummary),
    fullResponse: emptyToNull(data.fullResponse),
    confidenceScore:
      data.confidenceScore === "" ? null : Number(data.confidenceScore),
    snapshotDate: data.snapshotDate ? new Date(data.snapshotDate) : null,
    notes: emptyToNull(data.notes),
    updatedAt: new Date(),
  };
}

function validationError(
  values: AiSnapshotFormValues,
): AiSnapshotActionResult | null {
  const parsed = aiSnapshotFormSchema.safeParse(values);
  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof AiSnapshotFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof AiSnapshotFormValues;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Some fields need attention.", fieldErrors };
}

export async function createAiSnapshot(
  values: AiSnapshotFormValues,
): Promise<AiSnapshotActionResult> {
  const error = validationError(values);
  if (error) return error;

  const [row] = await db
    .insert(aiSnapshots)
    .values(toRecord(values))
    .returning({ id: aiSnapshots.id });

  revalidatePath("/ai-snapshots");
  redirect(`/ai-snapshots/${row.id}`);
}

export async function updateAiSnapshot(
  id: number,
  values: AiSnapshotFormValues,
): Promise<AiSnapshotActionResult> {
  if (!Number.isInteger(id)) {
    return { ok: false, message: "Invalid snapshot id." };
  }

  const error = validationError(values);
  if (error) return error;

  await db.update(aiSnapshots).set(toRecord(values)).where(eq(aiSnapshots.id, id));

  revalidatePath("/ai-snapshots");
  revalidatePath(`/ai-snapshots/${id}`);
  redirect(`/ai-snapshots/${id}`);
}

export async function deleteAiSnapshot(id: number): Promise<void> {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid snapshot id.");
  }

  await db.delete(aiSnapshots).where(eq(aiSnapshots.id, id));

  revalidatePath("/ai-snapshots");
  redirect("/ai-snapshots");
}
