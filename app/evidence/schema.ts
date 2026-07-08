import { z } from "zod";

// ---------------------------------------------------------------------------
// Enum values — MUST stay in sync with db/schema.ts
// ---------------------------------------------------------------------------

export const sourceTypeValues = [
  "official",
  "employer",
  "media",
  "podcast",
  "video",
  "book_retailer",
  "directory",
  "social",
  "search_result",
  "ai_response",
  "other",
] as const;

export const evidenceStrengthValues = ["strong", "moderate", "weak"] as const;

export const evidenceStatusValues = [
  "valid",
  "incomplete",
  "outdated",
  "broken",
  "incorrect",
] as const;

export type SourceType = (typeof sourceTypeValues)[number];
export type EvidenceStrength = (typeof evidenceStrengthValues)[number];
export type EvidenceStatus = (typeof evidenceStatusValues)[number];

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const sourceTypeLabels: Record<SourceType, string> = {
  official: "Official",
  employer: "Employer",
  media: "Media",
  podcast: "Podcast",
  video: "Video",
  book_retailer: "Book Retailer",
  directory: "Directory",
  social: "Social",
  search_result: "Search Result",
  ai_response: "AI Response",
  other: "Other",
};

export const evidenceStrengthLabels: Record<EvidenceStrength, string> = {
  strong: "Strong",
  moderate: "Moderate",
  weak: "Weak",
};

export const evidenceStatusLabels: Record<EvidenceStatus, string> = {
  valid: "Valid",
  incomplete: "Incomplete",
  outdated: "Outdated",
  broken: "Broken",
  incorrect: "Incorrect",
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

export const strengthBadgeVariant: Record<EvidenceStrength, BadgeVariant> = {
  strong: "success",
  moderate: "secondary",
  weak: "warning",
};

export const statusBadgeVariant: Record<EvidenceStatus, BadgeVariant> = {
  valid: "success",
  incomplete: "warning",
  outdated: "muted",
  broken: "destructive",
  incorrect: "destructive",
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

export const evidenceFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    sourceUrl: urlField,
    sourceType: z.enum(sourceTypeValues),
    evidenceStrength: z.enum(evidenceStrengthValues),
    evidenceStatus: z.enum(evidenceStatusValues),
    quoteOrSummary: z.string().trim(),
    datePublished: dateField,
    claimId: z.string().trim(),
    assetId: z.string().trim(),
    notes: z.string().trim(),
  })
  .refine((data) => data.claimId !== "" || data.assetId !== "", {
    message: "Link this evidence to at least one claim or asset.",
    path: ["claimId"],
  });

export type EvidenceFormValues = z.infer<typeof evidenceFormSchema>;

export const emptyEvidenceForm: EvidenceFormValues = {
  title: "",
  sourceUrl: "",
  sourceType: "official",
  evidenceStrength: "moderate",
  evidenceStatus: "valid",
  quoteOrSummary: "",
  datePublished: "",
  claimId: "",
  assetId: "",
  notes: "",
};
