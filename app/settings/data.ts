import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { settings } from "@/db/schema";
import {
  AI_VISIBILITY_KEY,
  SEARCH_VISIBILITY_KEY,
} from "@/lib/scores";
import { defaultSettingsForm, type SettingsFormValues } from "./schema";

const SETTING_KEYS = [SEARCH_VISIBILITY_KEY, AI_VISIBILITY_KEY] as const;

export async function getSettingsFormValues(): Promise<SettingsFormValues> {
  const rows = await db
    .select({ key: settings.key, value: settings.value })
    .from(settings)
    .where(inArray(settings.key, [...SETTING_KEYS]));

  const map = new Map(rows.map((r) => [r.key, r.value ?? ""]));

  return {
    searchVisibilityHealth:
      map.get(SEARCH_VISIBILITY_KEY) || defaultSettingsForm.searchVisibilityHealth,
    aiVisibilityHealth:
      map.get(AI_VISIBILITY_KEY) || defaultSettingsForm.aiVisibilityHealth,
  };
}

async function upsertSetting(key: string, value: string) {
  const existing = await db
    .select({ id: settings.id })
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  if (existing[0]) {
    await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

export async function saveSettings(values: SettingsFormValues) {
  await upsertSetting(SEARCH_VISIBILITY_KEY, values.searchVisibilityHealth);
  await upsertSetting(AI_VISIBILITY_KEY, values.aiVisibilityHealth);
}
