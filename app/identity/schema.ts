import { z } from "zod";

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

export const identitySchema = z.object({
  canonicalName: z.string().trim().min(1, "Canonical name is required"),
  preferredShortName: z.string().trim(),
  primaryTitle: z.string().trim(),
  canonicalIdentitySentence: z.string().trim(),
  shortBio25: z.string().trim(),
  shortBio50: z.string().trim(),
  bio100: z.string().trim(),
  bio250: z.string().trim(),
  mediaBio500: z.string().trim(),
  location: z.string().trim(),
  canonicalWebsiteUrl: urlField,
  canonicalHeadshotUrl: urlField,
});

export type IdentityFormValues = z.infer<typeof identitySchema>;

export const SEED_CANONICAL_NAME = "Michael Pearson-Adams";
export const SEED_CANONICAL_IDENTITY_SENTENCE =
  "Michael Pearson-Adams is an Australian product strategist, author, speaker and creative technologist whose work spans AI, audio technology, product management and creative innovation.";

export type FieldKind = "input" | "url" | "textarea";

export interface FieldConfig {
  name: keyof IdentityFormValues;
  label: string;
  description?: string;
  placeholder?: string;
  kind: FieldKind;
  rows?: number;
}

export interface FieldGroup {
  title: string;
  description: string;
  fields: FieldConfig[];
}

export const fieldGroups: FieldGroup[] = [
  {
    title: "Core Identity",
    description: "The canonical way this person is described everywhere.",
    fields: [
      {
        name: "canonicalName",
        label: "Canonical Name",
        description: "Required. The one authoritative name.",
        placeholder: "Michael Pearson-Adams",
        kind: "input",
      },
      {
        name: "preferredShortName",
        label: "Preferred Short Name",
        placeholder: "Michael",
        kind: "input",
      },
      {
        name: "primaryTitle",
        label: "Primary Title",
        placeholder: "Product Strategist, Author & Speaker",
        kind: "input",
      },
      {
        name: "canonicalIdentitySentence",
        label: "Canonical Identity Sentence",
        description: "The single-sentence definition used across sources.",
        placeholder: "One sentence that defines who this person is…",
        kind: "textarea",
        rows: 3,
      },
    ],
  },
  {
    title: "Bios",
    description: "Length-graded biographies for different placements.",
    fields: [
      {
        name: "shortBio25",
        label: "Short Bio (25 words)",
        kind: "textarea",
        rows: 2,
      },
      {
        name: "shortBio50",
        label: "Short Bio (50 words)",
        kind: "textarea",
        rows: 2,
      },
      {
        name: "bio100",
        label: "Bio (100 words)",
        kind: "textarea",
        rows: 3,
      },
      {
        name: "bio250",
        label: "Bio (250 words)",
        kind: "textarea",
        rows: 5,
      },
      {
        name: "mediaBio500",
        label: "Media Bio (500 words)",
        kind: "textarea",
        rows: 7,
      },
    ],
  },
  {
    title: "Links & Location",
    description: "Canonical destinations and where this person is based.",
    fields: [
      {
        name: "location",
        label: "Location",
        placeholder: "Brisbane, Australia",
        kind: "input",
      },
      {
        name: "canonicalWebsiteUrl",
        label: "Canonical Website URL",
        placeholder: "https://example.com",
        kind: "url",
      },
      {
        name: "canonicalHeadshotUrl",
        label: "Canonical Headshot URL",
        placeholder: "https://example.com/headshot.jpg",
        kind: "url",
      },
    ],
  },
];
