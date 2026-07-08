import { db } from "@/db";
import { identityProfile, type IdentityProfile } from "@/db/schema";

export async function getIdentityProfile(): Promise<IdentityProfile | null> {
  const rows = await db.select().from(identityProfile).limit(1);
  return rows[0] ?? null;
}
