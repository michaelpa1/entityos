import { z } from "zod";

// ---------------------------------------------------------------------------
// Enum values — MUST stay in sync with db/schema.ts
// ---------------------------------------------------------------------------

export const schemaTypeValues = [
  "person",
  "book",
  "podcast",
  "podcast_episode",
  "video_object",
  "article",
  "organization",
  "website",
  "breadcrumb_list",
  "faq_page",
  "image_object",
  "event",
  "course",
  "other",
] as const;

export const schemaStatusValues = [
  "missing",
  "planned",
  "implemented",
  "validated",
  "broken",
] as const;

export type SchemaType = (typeof schemaTypeValues)[number];
export type SchemaStatus = (typeof schemaStatusValues)[number];

// ---------------------------------------------------------------------------
// Labels — display the canonical schema.org type names
// ---------------------------------------------------------------------------

export const schemaTypeLabels: Record<SchemaType, string> = {
  person: "Person",
  book: "Book",
  podcast: "Podcast",
  podcast_episode: "PodcastEpisode",
  video_object: "VideoObject",
  article: "Article",
  organization: "Organization",
  website: "WebSite",
  breadcrumb_list: "BreadcrumbList",
  faq_page: "FAQPage",
  image_object: "ImageObject",
  event: "Event",
  course: "Course",
  other: "Other",
};

export const schemaStatusLabels: Record<SchemaStatus, string> = {
  missing: "Missing",
  planned: "Planned",
  implemented: "Implemented",
  validated: "Validated",
  broken: "Broken",
};

// ---------------------------------------------------------------------------
// Badge variants — missing (gray), planned (yellow), implemented (green),
// validated (blue), broken (red)
// ---------------------------------------------------------------------------

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "muted"
  | "destructive"
  | "success"
  | "warning"
  | "info";

export const schemaStatusBadgeVariant: Record<SchemaStatus, BadgeVariant> = {
  missing: "muted",
  planned: "warning",
  implemented: "success",
  validated: "info",
  broken: "destructive",
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

export const schemaItemFormSchema = z.object({
  schemaType: z.enum(schemaTypeValues),
  status: z.enum(schemaStatusValues),
  // "" (none) or the string form of an asset id — coerced in the action.
  relatedAssetId: z.string().trim(),
  validationUrl: urlField,
  notes: z.string().trim(),
});

export type SchemaItemFormValues = z.infer<typeof schemaItemFormSchema>;

export const emptySchemaItemForm: SchemaItemFormValues = {
  schemaType: "person",
  status: "missing",
  relatedAssetId: "",
  validationUrl: "",
  notes: "",
};
