"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { roadmapItems } from "@/db/schema";
import { roadmapFormSchema, type RoadmapFormValues } from "./schema";

export type RoadmapActionResult = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof RoadmapFormValues, string>>;
};

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toRecord(data: RoadmapFormValues) {
  return {
    title: data.title.trim(),
    description: emptyToNull(data.description),
    category: data.category,
    priority: data.priority,
    status: data.status,
    impact: data.impact,
    effort: data.effort,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    relatedAssetId:
      data.relatedAssetId === "" ? null : Number(data.relatedAssetId),
    relatedClaimId:
      data.relatedClaimId === "" ? null : Number(data.relatedClaimId),
    notes: emptyToNull(data.notes),
    updatedAt: new Date(),
  };
}

function validationError(
  values: RoadmapFormValues,
): RoadmapActionResult | null {
  const parsed = roadmapFormSchema.safeParse(values);
  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof RoadmapFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof RoadmapFormValues;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Some fields need attention.", fieldErrors };
}

export async function createRoadmapItem(
  values: RoadmapFormValues,
): Promise<RoadmapActionResult> {
  const error = validationError(values);
  if (error) return error;

  await db.insert(roadmapItems).values(toRecord(values));

  revalidatePath("/roadmap");
  redirect("/roadmap");
}

export async function updateRoadmapItem(
  id: number,
  values: RoadmapFormValues,
): Promise<RoadmapActionResult> {
  if (!Number.isInteger(id)) {
    return { ok: false, message: "Invalid roadmap item id." };
  }

  const error = validationError(values);
  if (error) return error;

  await db
    .update(roadmapItems)
    .set(toRecord(values))
    .where(eq(roadmapItems.id, id));

  revalidatePath("/roadmap");
  redirect("/roadmap");
}

export async function deleteRoadmapItem(id: number): Promise<void> {
  if (!Number.isInteger(id)) {
    throw new Error("Invalid roadmap item id.");
  }

  await db.delete(roadmapItems).where(eq(roadmapItems.id, id));

  revalidatePath("/roadmap");
  redirect("/roadmap");
}
