import { CheckAllLinksButton } from "./check-all-links-button";
import { SettingsForm } from "./settings-form";
import { RunAiSnapshotsButton } from "./run-ai-snapshots-button";
import { RunSearchSnapshotButton } from "./run-search-snapshot-button";
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

      <div className="flex flex-col gap-6">
        <SettingsForm defaultValues={defaultValues} />
        <RunSearchSnapshotButton />
        <CheckAllLinksButton />
        <RunAiSnapshotsButton />
      </div>
    </main>
  );
}
