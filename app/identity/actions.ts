"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { identityProfile } from "@/db/schema";
import {
  identitySchema,
  SEED_CANONICAL_IDENTITY_SENTENCE,
  SEED_CANONICAL_NAME,
  type IdentityFormValues,
} from "./schema";

export type IdentityActionResult = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof IdentityFormValues, string>>;
};

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function saveIdentity(
  values: IdentityFormValues,
): Promise<IdentityActionResult> {
  const parsed = identitySchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof IdentityFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof IdentityFormValues;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Some fields need attention.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  const record = {
    canonicalName: data.canonicalName.trim() || SEED_CANONICAL_NAME,
    preferredShortName: emptyToNull(data.preferredShortName),
    primaryTitle: emptyToNull(data.primaryTitle),
    canonicalIdentitySentence:
      emptyToNull(data.canonicalIdentitySentence) ??
      SEED_CANONICAL_IDENTITY_SENTENCE,
    shortBio25: emptyToNull(data.shortBio25),
    shortBio50: emptyToNull(data.shortBio50),
    bio100: emptyToNull(data.bio100),
    bio250: emptyToNull(data.bio250),
    mediaBio500: emptyToNull(data.mediaBio500),
    location: emptyToNull(data.location),
    canonicalWebsiteUrl: emptyToNull(data.canonicalWebsiteUrl),
    canonicalHeadshotUrl: emptyToNull(data.canonicalHeadshotUrl),
    updatedAt: new Date(),
  };

  const existing = await db
    .select({ id: identityProfile.id })
    .from(identityProfile)
    .limit(1);

  if (existing[0]) {
    await db
      .update(identityProfile)
      .set(record)
      .where(eq(identityProfile.id, existing[0].id));
  } else {
    await db.insert(identityProfile).values(record);
  }

  revalidatePath("/identity");
  redirect("/identity");
}
