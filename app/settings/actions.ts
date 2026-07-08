"use server";

import { revalidatePath } from "next/cache";

import { saveSettings } from "./data";
import { settingsFormSchema, type SettingsFormValues } from "./schema";

export type SettingsActionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<keyof SettingsFormValues, string>>;
    };

function validationError(
  values: SettingsFormValues,
): SettingsActionResult | null {
  const parsed = settingsFormSchema.safeParse(values);
  if (parsed.success) return null;

  const fieldErrors: Partial<Record<keyof SettingsFormValues, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof SettingsFormValues;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, message: "Some fields need attention.", fieldErrors };
}

export async function updateSettings(
  values: SettingsFormValues,
): Promise<SettingsActionResult> {
  const error = validationError(values);
  if (error) return error;

  await saveSettings(values);

  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true };
}
