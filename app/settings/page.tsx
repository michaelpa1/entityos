import { SettingsForm } from "./settings-form";
import { getSettingsFormValues } from "./data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const defaultValues = await getSettingsFormValues();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          App configuration and manual dashboard overrides.
        </p>
      </div>

      <SettingsForm defaultValues={defaultValues} />
    </main>
  );
}
