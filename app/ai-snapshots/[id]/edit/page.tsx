import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AiSnapshotForm } from "../../ai-snapshot-form";
import { getAiSnapshot } from "../../data";
import { type AiProvider, type AiSnapshotFormValues } from "../../schema";

export const dynamic = "force-dynamic";

function toDateInput(value: Date | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default async function EditAiSnapshotPage(
  props: PageProps<"/ai-snapshots/[id]/edit">,
) {
  const { id } = await props.params;
  const snapshot = await getAiSnapshot(Number(id));

  if (!snapshot) {
    notFound();
  }

  const defaultValues: AiSnapshotFormValues = {
    provider: snapshot.provider as AiProvider,
    prompt: snapshot.prompt,
    responseSummary: snapshot.responseSummary ?? "",
    fullResponse: snapshot.fullResponse ?? "",
    confidenceScore:
      snapshot.confidenceScore != null ? String(snapshot.confidenceScore) : "",
    snapshotDate: toDateInput(snapshot.snapshotDate),
    notes: snapshot.notes ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/ai-snapshots/${snapshot.id}`} />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to snapshot
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit AI snapshot
          </h1>
          <p className="text-sm text-muted-foreground">
            Update details for this snapshot.
          </p>
        </div>
      </div>

      <AiSnapshotForm
        mode="edit"
        snapshotId={snapshot.id}
        defaultValues={defaultValues}
      />
    </main>
  );
}
