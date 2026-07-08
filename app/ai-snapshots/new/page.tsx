import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AiSnapshotForm } from "../ai-snapshot-form";
import { emptyAiSnapshotForm } from "../schema";

export default function NewAiSnapshotPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/ai-snapshots" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to AI Snapshots
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            New AI snapshot
          </h1>
          <p className="text-sm text-muted-foreground">
            Record how an AI assistant describes the entity.
          </p>
        </div>
      </div>

      <AiSnapshotForm mode="create" defaultValues={emptyAiSnapshotForm} />
    </main>
  );
}
