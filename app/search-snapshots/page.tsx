import Link from "next/link";
import { PlusIcon, SearchIcon, CheckIcon, MinusIcon } from "lucide-react";

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
import { SearchSnapshotsFilters } from "./search-snapshots-filters";
import { getSearchSnapshots, type SearchSnapshotFilters } from "./data";
import {
  deviceLabels,
  searchEngineBadgeVariant,
  searchEngineLabels,
  searchEngineValues,
  type Device,
  type SearchEngine,
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

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
  ) : (
    <MinusIcon className="size-4 text-muted-foreground/50" />
  );
}

export default async function SearchSnapshotsPage(
  props: PageProps<"/search-snapshots">,
) {
  const searchParams = await props.searchParams;

  const filters: SearchSnapshotFilters = {
    searchEngine: parseEnum<SearchEngine>(
      searchParams.engine,
      searchEngineValues,
    ),
  };

  const snapshots = await getSearchSnapshots(filters);
  const isFiltered = !!filters.searchEngine;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Search Snapshots
          </h1>
          <p className="text-sm text-muted-foreground">
            How the entity appears across search engine results over time.
          </p>
        </div>
        <Button
          render={<Link href="/search-snapshots/new" />}
          className="self-start"
        >
          <PlusIcon />
          New snapshot
        </Button>
      </div>

      <div className="mb-5">
        <SearchSnapshotsFilters />
      </div>

      {snapshots.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">
                {isFiltered
                  ? "No snapshots match your filters"
                  : "No search snapshots yet"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {isFiltered
                  ? "Try clearing or changing the filter above."
                  : "Capture your first search snapshot to start tracking."}
              </p>
            </div>
            {!isFiltered ? (
              <Button render={<Link href="/search-snapshots/new" />}>
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
                <TableHead>Query</TableHead>
                <TableHead>Engine</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Panel</TableHead>
                <TableHead className="text-center">AI</TableHead>
                <TableHead>Top result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.map((snapshot) => (
                <TableRow key={snapshot.id}>
                  <TableCell className="max-w-xs font-medium whitespace-normal">
                    <Link
                      href={`/search-snapshots/${snapshot.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {snapshot.query}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        searchEngineBadgeVariant[
                          snapshot.searchEngine as SearchEngine
                        ]
                      }
                    >
                      {searchEngineLabels[snapshot.searchEngine as SearchEngine]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {deviceLabels[snapshot.device as Device]}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(snapshot.snapshotDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <BoolCell value={snapshot.hasKnowledgePanel} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <BoolCell value={snapshot.hasAiOverview} />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground whitespace-normal">
                    {snapshot.topResultTitle ?? (
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
