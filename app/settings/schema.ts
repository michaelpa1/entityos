import { z } from "zod";

const scoreField = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      (/^\d{1,3}$/.test(value) && Number(value) >= 0 && Number(value) <= 100),
    { message: "Enter a whole number from 0 to 100" },
  );

export const settingsFormSchema = z.object({
  searchVisibilityHealth: scoreField,
  aiVisibilityHealth: scoreField,
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const defaultSettingsForm: SettingsFormValues = {
  searchVisibilityHealth: "50",
  aiVisibilityHealth: "50",
};
