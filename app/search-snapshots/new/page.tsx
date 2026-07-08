import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchSnapshotForm } from "../search-snapshot-form";
import { emptySearchSnapshotForm } from "../schema";

export default function NewSearchSnapshotPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/search-snapshots" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Search Snapshots
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            New search snapshot
          </h1>
          <p className="text-sm text-muted-foreground">
            Record how the entity appears in a search result page.
          </p>
        </div>
      </div>

      <SearchSnapshotForm mode="create" defaultValues={emptySearchSnapshotForm} />
    </main>
  );
}
