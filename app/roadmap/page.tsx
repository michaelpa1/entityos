import Link from "next/link";
import { MapIcon, PlusIcon } from "lucide-react";

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
import { RoadmapFilters } from "./roadmap-filters";
import { getRoadmapItems, type RoadmapFilters as Filters } from "./data";
import {
  categoryLabels,
  categoryValues,
  effortLabels,
  impactLabels,
  priorityBadgeVariant,
  priorityLabels,
  priorityValues,
  statusBadgeVariant,
  statusLabels,
  statusValues,
  type Category,
  type Effort,
  type Impact,
  type Priority,
  type Status,
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

function formatDate(value: Date | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function RoadmapPage(props: PageProps<"/roadmap">) {
  const searchParams = await props.searchParams;

  const filters: Filters = {
    priority: parseEnum<Priority>(searchParams.priority, priorityValues),
    status: parseEnum<Status>(searchParams.status, statusValues),
    category: parseEnum<Category>(searchParams.category, categoryValues),
  };

  const items = await getRoadmapItems(filters);
  const isFiltered =
    !!filters.priority || !!filters.status || !!filters.category;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Roadmap
          </h1>
          <p className="text-sm text-muted-foreground">
            The prioritised plan for strengthening the entity.
          </p>
        </div>
        <Button render={<Link href="/roadmap/new" />} className="self-start">
          <PlusIcon />
          New roadmap item
        </Button>
      </div>

      <div className="mb-5">
        <RoadmapFilters />
      </div>

      {items.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MapIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">
                {isFiltered
                  ? "No roadmap items match your filters"
                  : "No roadmap items yet"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {isFiltered
                  ? "Try clearing or changing the filters above."
                  : "Add your first roadmap item to start planning."}
              </p>
            </div>
            {!isFiltered ? (
              <Button render={<Link href="/roadmap/new" />}>
                <PlusIcon />
                New roadmap item
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Effort</TableHead>
                <TableHead>Due date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const due = formatDate(item.dueDate);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/roadmap/${item.id}/edit`}
                        className="underline-offset-4 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {categoryLabels[item.category as Category]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={priorityBadgeVariant[item.priority as Priority]}
                      >
                        {priorityLabels[item.priority as Priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusBadgeVariant[item.status as Status]}
                      >
                        {statusLabels[item.status as Status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {impactLabels[item.impact as Impact]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {effortLabels[item.effort as Effort]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {due ?? <span className="text-muted-foreground/60">—</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}
        {isFiltered ? " matching filters" : ""}
      </p>
    </main>
  );
}
