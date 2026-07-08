import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LinkIcon,
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
import { getAsset } from "../data";
import {
  assetTypeLabels,
  entityRoleBadgeVariant,
  entityRoleLabels,
  ownershipTypeLabels,
  statusBadgeVariant,
  statusLabels,
  type AssetStatus,
  type AssetType,
  type EntityRole,
  type OwnershipType,
} from "../schema";
import { DeleteAssetDialog } from "./delete-asset";

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

function ScoreBar({ value }: { value: number | null }) {
  if (value == null) return <NotSet />;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
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

export default async function AssetDetailPage(
  props: PageProps<"/assets/[id]">,
) {
  const { id } = await props.params;
  const asset = await getAsset(Number(id));

  if (!asset) {
    notFound();
  }

  const status = asset.status as AssetStatus;
  const entityRole = asset.entityRole as EntityRole | null;
  const updated = formatDate(asset.updatedAt);
  const lastReviewed = formatDate(asset.lastReviewed);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/assets" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Assets
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {asset.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {assetTypeLabels[asset.assetType as AssetType]}
            </Badge>
            <Badge variant={statusBadgeVariant[status]}>
              {statusLabels[status]}
            </Badge>
            {entityRole ? (
              <Badge variant={entityRoleBadgeVariant[entityRole]}>
                {entityRoleLabels[entityRole]}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/assets/${asset.id}/edit`} />}
          >
            <PencilIcon />
            Edit
          </Button>
          <DeleteAssetDialog assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Everything recorded about this asset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <Row label="Name">{asset.name}</Row>
              <Row label="Asset type">
                {assetTypeLabels[asset.assetType as AssetType]}
              </Row>
              <Row label="URL">
                {asset.url ? (
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                  >
                    <span className="break-all">{asset.url}</span>
                    <ExternalLinkIcon className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Ownership">
                {asset.ownershipType ? (
                  ownershipTypeLabels[asset.ownershipType as OwnershipType]
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Entity role">
                {entityRole ? entityRoleLabels[entityRole] : <NotSet />}
              </Row>
              <Row label="Status">
                <Badge variant={statusBadgeVariant[status]}>
                  {statusLabels[status]}
                </Badge>
              </Row>
              <Row label="Authority score">
                <ScoreBar value={asset.authorityScore} />
              </Row>
              <Row label="Consistency score">
                <ScoreBar value={asset.consistencyScore} />
              </Row>
              <Row label="Notes">
                {asset.notes ? (
                  <span className="whitespace-pre-wrap">{asset.notes}</span>
                ) : (
                  <NotSet />
                )}
              </Row>
              <Row label="Last reviewed">
                {lastReviewed ?? <NotSet />}
              </Row>
              <Row label="Last updated">{updated ?? <NotSet />}</Row>
            </dl>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="size-4 text-muted-foreground" />
                Linked claims
              </CardTitle>
              <CardDescription>
                Claims supported by this asset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground/70 italic">
                No linked claims yet. Coming in a later phase.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="size-4 text-muted-foreground" />
                Linked evidence
              </CardTitle>
              <CardDescription>
                Evidence captured for this asset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground/70 italic">
                No linked evidence yet. Coming in a later phase.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
