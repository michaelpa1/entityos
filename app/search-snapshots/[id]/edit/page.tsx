import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchSnapshotForm } from "../../search-snapshot-form";
import { getSearchSnapshot } from "../../data";
import {
  type Device,
  type SearchEngine,
  type SearchSnapshotFormValues,
} from "../../schema";

export const dynamic = "force-dynamic";

function toDateInput(value: Date | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default async function EditSearchSnapshotPage(
  props: PageProps<"/search-snapshots/[id]/edit">,
) {
  const { id } = await props.params;
  const snapshot = await getSearchSnapshot(Number(id));

  if (!snapshot) {
    notFound();
  }

  const defaultValues: SearchSnapshotFormValues = {
    searchEngine: snapshot.searchEngine as SearchEngine,
    query: snapshot.query,
    location: snapshot.location ?? "",
    device: snapshot.device as Device,
    snapshotDate: toDateInput(snapshot.snapshotDate),
    hasKnowledgePanel: snapshot.hasKnowledgePanel,
    hasAiOverview: snapshot.hasAiOverview,
    topResultUrl: snapshot.topResultUrl ?? "",
    topResultTitle: snapshot.topResultTitle ?? "",
    observedSummary: snapshot.observedSummary ?? "",
    screenshotUrl: snapshot.screenshotUrl ?? "",
    notes: snapshot.notes ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/search-snapshots/${snapshot.id}`} />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to snapshot
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit search snapshot
          </h1>
          <p className="text-sm text-muted-foreground">
            Update details for “{snapshot.query}”.
          </p>
        </div>
      </div>

      <SearchSnapshotForm
        mode="edit"
        snapshotId={snapshot.id}
        defaultValues={defaultValues}
      />
    </main>
  );
}
