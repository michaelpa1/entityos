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

export type RunAiSnapshotsResult =
  | { ok: true; timestamp: string }
  | { ok: false; message: string };

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

/** Triggers the cron endpoint server-side (CRON_SECRET never sent to the client). */
export async function runAiSnapshotsNow(): Promise<RunAiSnapshotsResult> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return {
      ok: false,
      message: "CRON_SECRET is not configured on the server.",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const response = await fetch(`${baseUrl}/api/cron/ai-snapshots`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as {
    ok?: boolean;
    timestamp?: string;
    error?: string;
  } | null;

  if (!response.ok) {
    return {
      ok: false,
      message: body?.error ?? "AI snapshot run failed.",
    };
  }

  revalidatePath("/ai-snapshots");
  revalidatePath("/");

  return {
    ok: true,
    timestamp: body?.timestamp ?? new Date().toISOString(),
  };
}
