"use server";

import { revalidatePath } from "next/cache";

import { getAppBaseUrl } from "@/lib/cron";
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

export type RunSearchSnapshotResult =
  | {
      ok: true;
      query: string;
      position: number;
      ctrPercent: number;
      clicks: number;
      searchVolume: number;
      timestamp: string;
    }
  | { ok: false; message: string };

export type CheckLinksNowResult =
  | {
      ok: true;
      checked: number;
      broken: number;
      summary: string;
      brokenAssetIds: number[];
    }
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

  const baseUrl = getAppBaseUrl();

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

export async function runSearchSnapshotNow(): Promise<RunSearchSnapshotResult> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return {
      ok: false,
      message: "CRON_SECRET is not configured on the server.",
    };
  }

  const baseUrl = getAppBaseUrl();

  const response = await fetch(`${baseUrl}/api/cron/search-snapshots`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as {
    ok?: boolean;
    timestamp?: string;
    query?: string;
    position?: number;
    ctrPercent?: number;
    clicks?: number;
    searchVolume?: number;
    error?: string;
    message?: string;
  } | null;

  if (!response.ok || !body?.ok) {
    return {
      ok: false,
      message: body?.error ?? body?.message ?? "Search snapshot run failed.",
    };
  }

  revalidatePath("/search-snapshots");
  revalidatePath("/");

  return {
    ok: true,
    query: body.query ?? "",
    position: body.position ?? 0,
    ctrPercent: body.ctrPercent ?? 0,
    clicks: body.clicks ?? 0,
    searchVolume: body.searchVolume ?? 0,
    timestamp: body.timestamp ?? new Date().toISOString(),
  };
}

export async function checkAllLinksNow(): Promise<CheckLinksNowResult> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return {
      ok: false,
      message: "CRON_SECRET is not configured on the server.",
    };
  }

  const baseUrl = getAppBaseUrl();

  const response = await fetch(`${baseUrl}/api/cron/check-links`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as {
    ok?: boolean;
    checked?: number;
    broken?: number;
    summary?: string;
    brokenAssetIds?: number[];
    error?: string;
  } | null;

  if (!response.ok || !body?.ok) {
    return {
      ok: false,
      message: body?.error ?? "Link check failed.",
    };
  }

  revalidatePath("/assets");
  revalidatePath("/settings");
  revalidatePath("/");

  return {
    ok: true,
    checked: body.checked ?? 0,
    broken: body.broken ?? 0,
    summary: body.summary ?? "Link check completed.",
    brokenAssetIds: body.brokenAssetIds ?? [],
  };
}
