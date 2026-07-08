import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAiSnapshot } from "../data";
import {
  aiProviderBadgeVariant,
  aiProviderLabels,
  type AiProvider,
} from "../schema";
import { DeleteAiSnapshotDialog } from "./delete-ai-snapshot";

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

export default async function AiSnapshotDetailPage(
  props: PageProps<"/ai-snapshots/[id]">,
) {
  const { id } = await props.params;
  const snapshot = await getAiSnapshot(Number(id));

  if (!snapshot) {
    notFound();
  }

  const provider = snapshot.provider as AiProvider;
  const snapshotDate = formatDate(snapshot.snapshotDate);
  const updated = formatDate(snapshot.updatedAt);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/ai-snapshots" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to AI Snapshots
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {snapshot.prompt}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={aiProviderBadgeVariant[provider]}>
              {aiProviderLabels[provider]}
            </Badge>
            {snapshotDate ? (
              <Badge variant="muted">{snapshotDate}</Badge>
            ) : null}
            {snapshot.confidenceScore != null ? (
              <Badge variant="outline">
                Confidence {snapshot.confidenceScore}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/ai-snapshots/${snapshot.id}/edit`} />}
          >
            <PencilIcon />
            Edit
          </Button>
          <DeleteAiSnapshotDialog
            snapshotId={snapshot.id}
            prompt={snapshot.prompt}
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
              <Row label="Provider">{aiProviderLabels[provider]}</Row>
              <Row label="Prompt">
                <span className="whitespace-pre-wrap">{snapshot.prompt}</span>
              </Row>
              <Row label="Response summary">
                {snapshot.responseSummary ? (
                  <span className="whitespace-pre-wrap">
                    {snapshot.responseSummary}
                  </span>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Full response">
                {snapshot.fullResponse ? (
                  <span className="whitespace-pre-wrap">
                    {snapshot.fullResponse}
                  </span>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Confidence score">
                {snapshot.confidenceScore != null ? (
                  snapshot.confidenceScore
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Snapshot date">{snapshotDate ?? <NotSet />}</Row>
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
