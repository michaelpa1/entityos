import { z } from "zod";

// ---------------------------------------------------------------------------
// Enum values — MUST stay in sync with db/schema.ts
// ---------------------------------------------------------------------------

export const aiProviderValues = [
  "chatgpt",
  "gemini",
  "perplexity",
  "claude",
  "other",
] as const;

export type AiProvider = (typeof aiProviderValues)[number];

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const aiProviderLabels: Record<AiProvider, string> = {
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  claude: "Claude",
  other: "Other",
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

export const aiProviderBadgeVariant: Record<AiProvider, BadgeVariant> = {
  chatgpt: "success",
  gemini: "default",
  perplexity: "secondary",
  claude: "warning",
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

// Date is handled as a string ("YYYY-MM-DD" from a date input) and coerced to a
// Date (or null) inside the server action.
const dateField = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date",
  });

// Score is handled as a string in the form (number input) and coerced to a
// number (or null) inside the server action.
const scoreField = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      (/^\d{1,3}$/.test(value) && Number(value) >= 0 && Number(value) <= 100),
    { message: "Enter a whole number from 0 to 100" },
  );

export const aiSnapshotFormSchema = z.object({
  provider: z.enum(aiProviderValues),
  prompt: z.string().trim().min(1, "Prompt is required"),
  responseSummary: z.string().trim(),
  fullResponse: z.string().trim(),
  confidenceScore: scoreField,
  snapshotDate: dateField,
  notes: z.string().trim(),
});

export type AiSnapshotFormValues = z.infer<typeof aiSnapshotFormSchema>;

export const emptyAiSnapshotForm: AiSnapshotFormValues = {
  provider: "chatgpt",
  prompt: "",
  responseSummary: "",
  fullResponse: "",
  confidenceScore: "",
  snapshotDate: "",
  notes: "",
};
