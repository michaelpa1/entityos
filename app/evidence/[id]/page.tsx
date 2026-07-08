import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  LayersIcon,
  MessageSquareQuoteIcon,
  PencilIcon,
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
import { getEvidenceItem } from "../data";
import {
  evidenceStatusLabels,
  evidenceStrengthLabels,
  sourceTypeLabels,
  statusBadgeVariant,
  strengthBadgeVariant,
  type EvidenceStatus,
  type EvidenceStrength,
  type SourceType,
} from "../schema";
import { DeleteEvidenceDialog } from "./delete-evidence";

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

function formatDate(value: Date | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EvidenceDetailPage(
  props: PageProps<"/evidence/[id]">,
) {
  const { id } = await props.params;
  const item = await getEvidenceItem(Number(id));

  if (!item) {
    notFound();
  }

  const strength = item.evidenceStrength as EvidenceStrength;
  const status = item.evidenceStatus as EvidenceStatus;
  const datePublished = formatDate(item.datePublished);
  const updated = formatDate(item.updatedAt);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/evidence" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Evidence
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {item.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {sourceTypeLabels[item.sourceType as SourceType]}
            </Badge>
            <Badge variant={strengthBadgeVariant[strength]}>
              {evidenceStrengthLabels[strength]}
            </Badge>
            <Badge variant={statusBadgeVariant[status]}>
              {evidenceStatusLabels[status]}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/evidence/${item.id}/edit`} />}
          >
            <PencilIcon />
            Edit
          </Button>
          <DeleteEvidenceDialog evidenceId={item.id} title={item.title} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Everything recorded about this source.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <Row label="Title">{item.title}</Row>
              <Row label="Source type">
                {sourceTypeLabels[item.sourceType as SourceType]}
              </Row>
              <Row label="Source URL">
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                  >
                    <span className="break-all">{item.sourceUrl}</span>
                    <ExternalLinkIcon className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Strength">
                <Badge variant={strengthBadgeVariant[strength]}>
                  {evidenceStrengthLabels[strength]}
                </Badge>
              </Row>
              <Row label="Status">
                <Badge variant={statusBadgeVariant[status]}>
                  {evidenceStatusLabels[status]}
                </Badge>
              </Row>
              <Row label="Quote / summary">
                {item.quoteOrSummary ? (
                  <span className="whitespace-pre-wrap">
                    {item.quoteOrSummary}
                  </span>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Date published">{datePublished ?? <NotSet />}</Row>
              <Row label="Notes">
                {item.notes ? (
                  <span className="whitespace-pre-wrap">{item.notes}</span>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Last updated">{updated ?? <NotSet />}</Row>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked to</CardTitle>
            <CardDescription>
              What this evidence supports in the entity.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {item.claimId && item.claimText ? (
              <Link
                href={`/claims/${item.claimId}`}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50"
              >
                <MessageSquareQuoteIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Claim · </span>
                  {item.claimText}
                </span>
              </Link>
            ) : null}
            {item.assetId && item.assetName ? (
              <Link
                href={`/assets/${item.assetId}`}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50"
              >
                <LayersIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Asset · </span>
                  {item.assetName}
                </span>
              </Link>
            ) : null}
            {!item.claimId && !item.assetId ? (
              <p className="text-sm text-muted-foreground/70 italic">
                Not linked to anything.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
