"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { searchSnapshots } from "@/db/schema";
import {
  searchSnapshotFormSchema,
  type SearchSnapshotFormValues,
} from "./schema";

export type SearchSnapshotActionResult = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof SearchSnapshotFormValues, string>>;
};

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toRecord(data: SearchSnapshotFormValues) {
  return {
    searchEngine: data.searchEngine,
    query: data.query.trim(),
    location: emptyToNull(data.location),
    device: data.device,
    snapshotDate: data.snapshotDate ? new Date(data.snapshotDate) : null,
    hasKnowledgePanel: data.hasKnowledgePanel,
    hasAiOverview: data.hasAiOverview,
    topResultUrl: emptyToNull(data.topResultUrl),
    topResultTitle: emptyToNull(data.topResultTitle),
    observedSummary: emptyToNull(data.observedSummary),
    screenshotUrl: emptyToNull(data.screenshotUrl),
    notes: emptyToNull(data.notes),
    updatedAt: new Date(),
  };
}

function validationError(
  values: SearchSnapshotFormValues,
): SearchSnapshotActionResult | null {
  const parsed = searchSnapshotFormSchema.safeParse(values);
  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof SearchSnapshotFormValues, string>> =
    {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof SearchSnapshotFormValues;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Some fields need attention.", fieldErrors };
}

export async function createSearchSnapshot(
  values: SearchSnapshotFormValues,
): Promise<SearchSnapshotActionResult> {
  const error = validationError(values);
  if (error) return error;

  const [row] = await db
    .insert(searchSnapshots)
    .values(toRecord(values))
    .returning({ id: searchSnapshots.id });

  revalidatePath("/search-snapshots");
  redirect(`/search-snapshots/${row.id}`);
}

export async function updateSearchSnapshot(
  id: number,
  values: SearchSnapshotFormValues,
): Promise<SearchSnapshotActionResult> {
  if (!Number.isInteger(id)) {
    return { ok: false, message: "Invalid snapshot id." };
  }

  const error = validationError(values);
  if (error) return error;

  await db
    .update(searchSnapshots)
    .set(toRecord(values))
    .where(eq(searchSnapshots.id, id));

  revalidatePath("/search-snapshots");
  revalidatePath(`/search-snapshots/${id}`);
  redirect(`/search-snapshots/${id}`);
}

export async function deleteSearchSnapshot(id: number): Promise<void> {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid snapshot id.");
  }

  await db.delete(searchSnapshots).where(eq(searchSnapshots.id, id));

  revalidatePath("/search-snapshots");
  redirect("/search-snapshots");
}
