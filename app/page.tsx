import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  FileSearchIcon,
  LayersIcon,
  MapIcon,
  MessageSquareQuoteIcon,
  TablePropertiesIcon,
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
import { Progress } from "@/components/ui/progress";
import { getDashboardData } from "@/lib/scores";

export const dynamic = "force-dynamic";

type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "muted"
  | "destructive"
  | "success"
  | "warning"
  | "info";

function scoreBadge(score: number): { label: string; variant: BadgeVariant } {
  if (score >= 70) return { label: "Good", variant: "success" };
  if (score >= 40) return { label: "Fair", variant: "warning" };
  return { label: "Low", variant: "destructive" };
}

function MetricCard({
  title,
  score,
  manual,
}: {
  title: string;
  score: number;
  manual?: boolean;
}) {
  const badge = scoreBadge(score);
  return (
    <Card size="sm">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">
            {title}
          </CardTitle>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {manual ? (
              <Badge variant="outline" className="text-[10px]">
                Manual
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <p className="text-3xl font-semibold tabular-nums tracking-tight">
          {score}
        </p>
        <Progress value={score} />
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function QuickListItem({
  href,
  primary,
  secondary,
}: {
  href: string;
  primary: string;
  secondary?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex flex-col gap-0.5 rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-muted"
      >
        <span className="line-clamp-2 text-sm font-medium leading-snug">
          {primary}
        </span>
        {secondary ? (
          <span className="text-xs text-muted-foreground">{secondary}</span>
        ) : null}
      </Link>
    </li>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground/70 italic">{children}</p>
  );
}

function formatRelativeDate(value: Date): string {
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { metrics } = data;
  const healthBadge = scoreBadge(metrics.entityHealthScore);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Entity health at a glance — scores, summaries and what needs
          attention.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Row 1 — Entity Health Score */}
        <Card className="items-center py-8 text-center sm:py-10">
          <CardHeader className="w-full max-w-lg items-center">
            <CardDescription>Entity Health Score</CardDescription>
            <div className="flex items-center justify-center gap-3">
              <CardTitle className="text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
                {metrics.entityHealthScore}
              </CardTitle>
              <Badge variant={healthBadge.variant} className="text-sm">
                {healthBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Average of identity, evidence, schema, search and AI visibility
            </p>
          </CardHeader>
          <CardContent className="w-full max-w-md">
            <Progress value={metrics.entityHealthScore} className="h-3" />
          </CardContent>
        </Card>

        {/* Row 2 — Five key metrics */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Identity Consistency"
            score={metrics.identityConsistency}
          />
          <MetricCard
            title="Evidence Coverage"
            score={metrics.evidenceCoverage}
          />
          <MetricCard title="Schema Health" score={metrics.schemaHealth} />
          <MetricCard
            title="Search Visibility"
            score={metrics.searchVisibilityHealth}
            manual
          />
          <MetricCard
            title="AI Visibility"
            score={metrics.aiVisibilityHealth}
            manual
          />
        </section>

        {/* Row 3 — Detail summaries */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayersIcon className="size-4 text-muted-foreground" />
                Assets
              </CardTitle>
              <CardDescription>{data.assetsSummary.total} total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Active" value={data.assetsSummary.active} />
              <StatRow label="Broken" value={data.assetsSummary.broken} />
              <StatRow label="Outdated" value={data.assetsSummary.outdated} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareQuoteIcon className="size-4 text-muted-foreground" />
                Claims
              </CardTitle>
              <CardDescription>{data.claimsSummary.total} total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Strong" value={data.claimsSummary.strong} />
              <StatRow label="Moderate" value={data.claimsSummary.moderate} />
              <StatRow label="Weak" value={data.claimsSummary.weak} />
              <StatRow
                label="Unsupported"
                value={data.claimsSummary.unsupported}
              />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearchIcon className="size-4 text-muted-foreground" />
                Evidence
              </CardTitle>
              <CardDescription>
                {data.evidenceSummary.total} total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Strong" value={data.evidenceSummary.strong} />
              <StatRow label="Moderate" value={data.evidenceSummary.moderate} />
              <StatRow label="Weak" value={data.evidenceSummary.weak} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TablePropertiesIcon className="size-4 text-muted-foreground" />
                Schema
              </CardTitle>
              <CardDescription>By implementation status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Missing" value={data.schemaStatus.missing ?? 0} />
              <StatRow label="Planned" value={data.schemaStatus.planned ?? 0} />
              <StatRow
                label="Implemented"
                value={data.schemaStatus.implemented ?? 0}
              />
              <StatRow
                label="Validated"
                value={data.schemaStatus.validated ?? 0}
              />
              <StatRow label="Broken" value={data.schemaStatus.broken ?? 0} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="size-4 text-muted-foreground" />
                Roadmap
              </CardTitle>
              <CardDescription>By status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <StatRow label="Backlog" value={data.roadmapStatus.backlog ?? 0} />
              <StatRow
                label="In progress"
                value={data.roadmapStatus.in_progress ?? 0}
              />
              <StatRow label="Done" value={data.roadmapStatus.done ?? 0} />
            </CardContent>
          </Card>
        </section>

        {/* Row 4 — Quick access */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Current Sprint</CardTitle>
              <CardDescription>Priority &ldquo;now&rdquo; items</CardDescription>
            </CardHeader>
            <CardContent>
              {data.sprintItems.length === 0 ? (
                <EmptyNote>No sprint items right now.</EmptyNote>
              ) : (
                <ul className="space-y-1">
                  {data.sprintItems.map((item) => (
                    <QuickListItem
                      key={item.id}
                      href={`/roadmap/${item.id}/edit`}
                      primary={item.title}
                      secondary={item.status.replace("_", " ")}
                    />
                  ))}
                </ul>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 -ml-2 text-muted-foreground"
                render={<Link href="/roadmap?priority=now" />}
              >
                View all
                <ArrowRightIcon />
              </Button>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangleIcon className="size-4 text-destructive" />
                Broken Assets
              </CardTitle>
              <CardDescription>Broken with authority &gt; 50</CardDescription>
            </CardHeader>
            <CardContent>
              {data.brokenHighAuthorityAssets.length === 0 ? (
                <EmptyNote>No high-authority broken assets.</EmptyNote>
              ) : (
                <ul className="space-y-1">
                  {data.brokenHighAuthorityAssets.map((asset) => (
                    <QuickListItem
                      key={asset.id}
                      href={`/assets/${asset.id}`}
                      primary={asset.name}
                      secondary={
                        asset.authorityScore != null
                          ? `Authority ${asset.authorityScore}`
                          : undefined
                      }
                    />
                  ))}
                </ul>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 -ml-2 text-muted-foreground"
                render={<Link href="/assets?status=broken" />}
              >
                View all
                <ArrowRightIcon />
              </Button>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Unsupported Claims</CardTitle>
              <CardDescription>High importance, no backing</CardDescription>
            </CardHeader>
            <CardContent>
              {data.unsupportedHighClaims.length === 0 ? (
                <EmptyNote>No unsupported high-importance claims.</EmptyNote>
              ) : (
                <ul className="space-y-1">
                  {data.unsupportedHighClaims.map((claim) => (
                    <QuickListItem
                      key={claim.id}
                      href={`/claims/${claim.id}`}
                      primary={claim.claimText}
                    />
                  ))}
                </ul>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 -ml-2 text-muted-foreground"
                render={<Link href="/claims" />}
              >
                View claims
                <ArrowRightIcon />
              </Button>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Recent Evidence</CardTitle>
              <CardDescription>Latest additions</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentEvidence.length === 0 ? (
                <EmptyNote>No evidence recorded yet.</EmptyNote>
              ) : (
                <ul className="space-y-1">
                  {data.recentEvidence.map((item) => (
                    <QuickListItem
                      key={item.id}
                      href={`/evidence/${item.id}`}
                      primary={item.title}
                      secondary={formatRelativeDate(item.createdAt)}
                    />
                  ))}
                </ul>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 -ml-2 text-muted-foreground"
                render={<Link href="/evidence" />}
              >
                View all
                <ArrowRightIcon />
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
