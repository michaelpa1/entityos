import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  PencilIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSearchSnapshot } from "../data";
import {
  deviceLabels,
  searchEngineBadgeVariant,
  searchEngineLabels,
  type Device,
  type SearchEngine,
} from "../schema";
import { DeleteSearchSnapshotDialog } from "./delete-search-snapshot";

export const dynamic = "force-dynamic";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:gap-4 sm:py-2.5">
      <dt className="w-full shrink-0 text-sm font-medium text-muted-foreground sm:w-48">
        {label}
      </dt>
      <dd className="w-full text-sm break-words">{children}</dd>
    </div>
  );
}

function NotSet() {
  return <span className="text-muted-foreground/60 italic">Not set</span>;
}

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1.5">
      <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <XIcon className="size-4" />
      No
    </span>
  );
}

function formatDate(value: Date | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function SearchSnapshotDetailPage(
  props: PageProps<"/search-snapshots/[id]">,
) {
  const { id } = await props.params;
  const snapshot = await getSearchSnapshot(Number(id));

  if (!snapshot) {
    notFound();
  }

  const engine = snapshot.searchEngine as SearchEngine;
  const snapshotDate = formatDate(snapshot.snapshotDate);
  const updated = formatDate(snapshot.updatedAt);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/search-snapshots" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Search Snapshots
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {snapshot.query}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={searchEngineBadgeVariant[engine]}>
              {searchEngineLabels[engine]}
            </Badge>
            <Badge variant="outline">
              {deviceLabels[snapshot.device as Device]}
            </Badge>
            {snapshotDate ? (
              <Badge variant="muted">{snapshotDate}</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/search-snapshots/${snapshot.id}/edit`} />}
          >
            <PencilIcon />
            Edit
          </Button>
          <DeleteSearchSnapshotDialog
            snapshotId={snapshot.id}
            query={snapshot.query}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Everything recorded about this snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <Row label="Query">{snapshot.query}</Row>
              <Row label="Search engine">{searchEngineLabels[engine]}</Row>
              <Row label="Location">
                {snapshot.location ? snapshot.location : <NotSet />}
              </Row>
              <Row label="Device">{deviceLabels[snapshot.device as Device]}</Row>
              <Row label="Snapshot date">{snapshotDate ?? <NotSet />}</Row>
              <Row label="Has knowledge panel">
                <YesNo value={snapshot.hasKnowledgePanel} />
              </Row>
              <Row label="Has AI overview">
                <YesNo value={snapshot.hasAiOverview} />
              </Row>
              <Row label="Top result title">
                {snapshot.topResultTitle ? (
                  snapshot.topResultTitle
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Top result URL">
                {snapshot.topResultUrl ? (
                  <a
                    href={snapshot.topResultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                  >
                    <span className="break-all">{snapshot.topResultUrl}</span>
                    <ExternalLinkIcon className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Observed summary">
                {snapshot.observedSummary ? (
                  <span className="whitespace-pre-wrap">
                    {snapshot.observedSummary}
                  </span>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Screenshot URL">
                {snapshot.screenshotUrl ? (
                  <a
                    href={snapshot.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                  >
                    <span className="break-all">{snapshot.screenshotUrl}</span>
                    <ExternalLinkIcon className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Notes">
                {snapshot.notes ? (
                  <span className="whitespace-pre-wrap">{snapshot.notes}</span>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Last updated">{updated ?? <NotSet />}</Row>
            </dl>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
