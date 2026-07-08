import { z } from "zod";

// ---------------------------------------------------------------------------
// Enum values — MUST stay in sync with db/schema.ts
// ---------------------------------------------------------------------------

export const claimTypeValues = [
  "identity",
  "role",
  "credential",
  "product",
  "book",
  "speaking",
  "media",
  "award",
  "location",
  "employer",
  "expertise",
  "other",
] as const;

export const confidenceValues = [
  "strong",
  "moderate",
  "weak",
  "unsupported",
  "disputed",
] as const;

export const publicImportanceValues = ["high", "medium", "low"] as const;

export type ClaimType = (typeof claimTypeValues)[number];
export type Confidence = (typeof confidenceValues)[number];
export type PublicImportance = (typeof publicImportanceValues)[number];

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const claimTypeLabels: Record<ClaimType, string> = {
  identity: "Identity",
  role: "Role",
  credential: "Credential",
  product: "Product",
  book: "Book",
  speaking: "Speaking",
  media: "Media",
  award: "Award",
  location: "Location",
  employer: "Employer",
  expertise: "Expertise",
  other: "Other",
};

export const confidenceLabels: Record<Confidence, string> = {
  strong: "Strong",
  moderate: "Moderate",
  weak: "Weak",
  unsupported: "Unsupported",
  disputed: "Disputed",
};

export const publicImportanceLabels: Record<PublicImportance, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
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

export const confidenceBadgeVariant: Record<Confidence, BadgeVariant> = {
  strong: "success",
  moderate: "secondary",
  weak: "warning",
  unsupported: "muted",
  disputed: "destructive",
};

export const publicImportanceBadgeVariant: Record<
  PublicImportance,
  BadgeVariant
> = {
  high: "default",
  medium: "secondary",
  low: "muted",
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

export const claimFormSchema = z.object({
  claimText: z.string().trim().min(1, "Claim text is required"),
  claimType: z.enum(claimTypeValues),
  confidence: z.enum(confidenceValues),
  publicImportance: z.enum(publicImportanceValues),
  shouldBePublic: z.boolean(),
  notes: z.string().trim(),
});

export type ClaimFormValues = z.infer<typeof claimFormSchema>;

export const emptyClaimForm: ClaimFormValues = {
  claimText: "",
  claimType: "role",
  confidence: "moderate",
  publicImportance: "medium",
  shouldBePublic: true,
  notes: "",
};
