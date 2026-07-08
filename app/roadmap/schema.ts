import { z } from "zod";

// ---------------------------------------------------------------------------
// Enum values — MUST stay in sync with db/schema.ts
// ---------------------------------------------------------------------------

export const priorityValues = ["now", "next", "later", "someday"] as const;

export const statusValues = [
  "backlog",
  "in_progress",
  "blocked",
  "done",
] as const;

export const categoryValues = [
  "identity",
  "website",
  "schema",
  "books",
  "podcast",
  "video",
  "press",
  "speaking",
  "profiles",
  "ai_visibility",
  "search_visibility",
  "evidence",
  "cleanup",
  "other",
] as const;

export const impactValues = ["high", "medium", "low"] as const;

export const effortValues = ["small", "medium", "large"] as const;

export type Priority = (typeof priorityValues)[number];
export type Status = (typeof statusValues)[number];
export type Category = (typeof categoryValues)[number];
export type Impact = (typeof impactValues)[number];
export type Effort = (typeof effortValues)[number];

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const priorityLabels: Record<Priority, string> = {
  now: "Now",
  next: "Next",
  later: "Later",
  someday: "Someday",
};

export const statusLabels: Record<Status, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

export const categoryLabels: Record<Category, string> = {
  identity: "Identity",
  website: "Website",
  schema: "Schema",
  books: "Books",
  podcast: "Podcast",
  video: "Video",
  press: "Press",
  speaking: "Speaking",
  profiles: "Profiles",
  ai_visibility: "AI Visibility",
  search_visibility: "Search Visibility",
  evidence: "Evidence",
  cleanup: "Cleanup",
  other: "Other",
};

export const impactLabels: Record<Impact, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const effortLabels: Record<Effort, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
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
  | "warning"
  | "info";

export const priorityBadgeVariant: Record<Priority, BadgeVariant> = {
  now: "default",
  next: "info",
  later: "secondary",
  someday: "muted",
};

export const statusBadgeVariant: Record<Status, BadgeVariant> = {
  backlog: "muted",
  in_progress: "info",
  blocked: "destructive",
  done: "success",
};

export const impactBadgeVariant: Record<Impact, BadgeVariant> = {
  high: "success",
  medium: "secondary",
  low: "muted",
};

export const effortBadgeVariant: Record<Effort, BadgeVariant> = {
  small: "success",
  medium: "warning",
  large: "muted",
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

// Date is a string ("YYYY-MM-DD" from a date input) coerced in the action.
const dateField = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date",
  });

export const roadmapFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim(),
  category: z.enum(categoryValues),
  priority: z.enum(priorityValues),
  status: z.enum(statusValues),
  impact: z.enum(impactValues),
  effort: z.enum(effortValues),
  dueDate: dateField,
  relatedAssetId: z.string().trim(),
  relatedClaimId: z.string().trim(),
  notes: z.string().trim(),
});

export type RoadmapFormValues = z.infer<typeof roadmapFormSchema>;

export const emptyRoadmapForm: RoadmapFormValues = {
  title: "",
  description: "",
  category: "other",
  priority: "next",
  status: "backlog",
  impact: "medium",
  effort: "medium",
  dueDate: "",
  relatedAssetId: "",
  relatedClaimId: "",
  notes: "",
};
