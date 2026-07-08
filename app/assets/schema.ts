import { z } from "zod";

// ---------------------------------------------------------------------------
// Enum values — these MUST stay in sync with db/schema.ts
// ---------------------------------------------------------------------------

export const assetTypeValues = [
  "website",
  "book",
  "podcast",
  "podcast_episode",
  "youtube_channel",
  "youtube_video",
  "article",
  "interview",
  "speaking_event",
  "professional_profile",
  "social_profile",
  "press",
  "company_page",
  "product",
  "photography",
  "music",
  "other",
] as const;

export const ownershipTypeValues = [
  "owned",
  "employer",
  "earned",
  "third_party",
  "social",
  "directory",
] as const;

export const entityRoleValues = [
  "primary_canonical",
  "supporting",
  "evidence",
  "weak_signal",
  "outdated",
] as const;

export const statusValues = [
  "active",
  "incomplete",
  "outdated",
  "broken",
  "needs_review",
] as const;

export type AssetType = (typeof assetTypeValues)[number];
export type OwnershipType = (typeof ownershipTypeValues)[number];
export type EntityRole = (typeof entityRoleValues)[number];
export type AssetStatus = (typeof statusValues)[number];

// ---------------------------------------------------------------------------
// Human-friendly labels
// ---------------------------------------------------------------------------

export const assetTypeLabels: Record<AssetType, string> = {
  website: "Website",
  book: "Book",
  podcast: "Podcast",
  podcast_episode: "Podcast Episode",
  youtube_channel: "YouTube Channel",
  youtube_video: "YouTube Video",
  article: "Article",
  interview: "Interview",
  speaking_event: "Speaking Event",
  professional_profile: "Professional Profile",
  social_profile: "Social Profile",
  press: "Press",
  company_page: "Company Page",
  product: "Product",
  photography: "Photography",
  music: "Music",
  other: "Other",
};

export const ownershipTypeLabels: Record<OwnershipType, string> = {
  owned: "Owned",
  employer: "Employer",
  earned: "Earned",
  third_party: "Third Party",
  social: "Social",
  directory: "Directory",
};

export const entityRoleLabels: Record<EntityRole, string> = {
  primary_canonical: "Primary / Canonical",
  supporting: "Supporting",
  evidence: "Evidence",
  weak_signal: "Weak Signal",
  outdated: "Outdated",
};

export const statusLabels: Record<AssetStatus, string> = {
  active: "Active",
  incomplete: "Incomplete",
  outdated: "Outdated",
  broken: "Broken",
  needs_review: "Needs Review",
};

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "muted"
  | "destructive"
  | "success"
  | "warning";

export const statusBadgeVariant: Record<AssetStatus, BadgeVariant> = {
  active: "success",
  incomplete: "warning",
  outdated: "muted",
  broken: "destructive",
  needs_review: "warning",
};

export const entityRoleBadgeVariant: Record<EntityRole, BadgeVariant> = {
  primary_canonical: "default",
  supporting: "secondary",
  evidence: "outline",
  weak_signal: "muted",
  outdated: "muted",
};

/** Options for building `<Select>` menus, in display order. */
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

// Scores are handled as strings in the form (text/number inputs) and coerced
// to numbers (or null) inside the server action.
const scoreField = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      (/^\d{1,3}$/.test(value) && Number(value) >= 0 && Number(value) <= 100),
    { message: "Enter a whole number from 0 to 100" },
  );

export const assetFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  assetType: z.enum(assetTypeValues),
  url: urlField,
  ownershipType: z.union([z.enum(ownershipTypeValues), z.literal("")]),
  entityRole: z.union([z.enum(entityRoleValues), z.literal("")]),
  status: z.enum(statusValues),
  authorityScore: scoreField,
  consistencyScore: scoreField,
  notes: z.string().trim(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

export const emptyAssetForm: AssetFormValues = {
  name: "",
  assetType: "website",
  url: "",
  ownershipType: "",
  entityRole: "",
  status: "active",
  authorityScore: "",
  consistencyScore: "",
  notes: "",
};
