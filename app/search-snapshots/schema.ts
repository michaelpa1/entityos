import { z } from "zod";

// ---------------------------------------------------------------------------
// Enum values — MUST stay in sync with db/schema.ts
// ---------------------------------------------------------------------------

export const searchEngineValues = ["google", "bing", "other"] as const;

export const deviceValues = ["desktop", "mobile"] as const;

export type SearchEngine = (typeof searchEngineValues)[number];
export type Device = (typeof deviceValues)[number];

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const searchEngineLabels: Record<SearchEngine, string> = {
  google: "Google",
  bing: "Bing",
  other: "Other",
};

export const deviceLabels: Record<Device, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
};

// ---------------------------------------------------------------------------
// Badge variants
// ---------------------------------------------------------------------------

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "muted"
  | "destructive"
  | "success"
  | "warning";

export const searchEngineBadgeVariant: Record<SearchEngine, BadgeVariant> = {
  google: "default",
  bing: "secondary",
  other: "muted",
};

export function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): { value: T; label: string }[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

// ---------------------------------------------------------------------------
// Form validation (Zod)
// ---------------------------------------------------------------------------

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const urlField = z
  .string()
  .trim()
  .refine((value) => value === "" || isValidHttpUrl(value), {
    message: "Enter a valid URL including http:// or https://",
  });

// Date is handled as a string ("YYYY-MM-DD" from a date input) and coerced to a
// Date (or null) inside the server action.
const dateField = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date",
  });

export const searchSnapshotFormSchema = z.object({
  searchEngine: z.enum(searchEngineValues),
  query: z.string().trim().min(1, "Query is required"),
  location: z.string().trim(),
  device: z.enum(deviceValues),
  snapshotDate: dateField,
  hasKnowledgePanel: z.boolean(),
  hasAiOverview: z.boolean(),
  topResultUrl: urlField,
  topResultTitle: z.string().trim(),
  observedSummary: z.string().trim(),
  screenshotUrl: urlField,
  notes: z.string().trim(),
});

export type SearchSnapshotFormValues = z.infer<typeof searchSnapshotFormSchema>;

export const emptySearchSnapshotForm: SearchSnapshotFormValues = {
  searchEngine: "google",
  query: "",
  location: "",
  device: "desktop",
  snapshotDate: "",
  hasKnowledgePanel: false,
  hasAiOverview: false,
  topResultUrl: "",
  topResultTitle: "",
  observedSummary: "",
  screenshotUrl: "",
  notes: "",
};
