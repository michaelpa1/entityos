import Link from "next/link";
import { PlusIcon, SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AiSnapshotsFilters } from "./ai-snapshots-filters";
import { getAiSnapshots, type AiSnapshotFilters } from "./data";
import {
  aiProviderBadgeVariant,
  aiProviderLabels,
  aiProviderValues,
  type AiProvider,
} from "./schema";

export const dynamic = "force-dynamic";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseEnum<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T[] | undefined {
  const single = firstValue(value);
  if (single && (allowed as readonly string[]).includes(single)) {
    return [single as T];
  }
  return undefined;
}

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AiSnapshotsPage(
  props: PageProps<"/ai-snapshots">,
) {
  const searchParams = await props.searchParams;

  const filters: AiSnapshotFilters = {
    provider: parseEnum<AiProvider>(searchParams.provider, aiProviderValues),
  };

  const snapshots = await getAiSnapshots(filters);
  const isFiltered = !!filters.provider;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            AI Snapshots
          </h1>
          <p className="text-sm text-muted-foreground">
            How AI assistants describe the entity for a given prompt.
          </p>
        </div>
        <Button
          render={<Link href="/ai-snapshots/new" />}
          className="self-start"
        >
          <PlusIcon />
          New snapshot
        </Button>
      </div>

      <div className="mb-5">
        <AiSnapshotsFilters />
      </div>

      {snapshots.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SparklesIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">
                {isFiltered
                  ? "No snapshots match your filters"
                  : "No AI snapshots yet"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {isFiltered
                  ? "Try clearing or changing the filter above."
                  : "Capture your first AI snapshot to start tracking."}
              </p>
            </div>
            {!isFiltered ? (
              <Button render={<Link href="/ai-snapshots/new" />}>
                <PlusIcon />
                New snapshot
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Provider</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.map((snapshot) => (
                <TableRow key={snapshot.id}>
                  <TableCell>
                    <Badge
                      variant={
                        aiProviderBadgeVariant[snapshot.provider as AiProvider]
                      }
                    >
                      {aiProviderLabels[snapshot.provider as AiProvider]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md font-medium">
                    <Link
                      href={`/ai-snapshots/${snapshot.id}`}
                      className="line-clamp-1 underline-offset-4 hover:underline"
                    >
                      {snapshot.prompt}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(snapshot.snapshotDate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {snapshot.confidenceScore ?? (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        {snapshots.length} {snapshots.length === 1 ? "snapshot" : "snapshots"}
        {isFiltered ? " matching filters" : ""}
      </p>
    </main>
  );
}
