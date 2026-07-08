import Link from "next/link";
import { PlusIcon, LayersIcon } from "lucide-react";

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
import { AssetsFilters } from "./assets-filters";
import { getAssets, type AssetFilters } from "./data";
import {
  assetTypeLabels,
  assetTypeValues,
  ownershipTypeLabels,
  ownershipTypeValues,
  statusBadgeVariant,
  statusLabels,
  statusValues,
  type AssetStatus,
  type AssetType,
  type OwnershipType,
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

function ScoreCell({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-muted-foreground/60">—</span>;
  }
  return <span className="tabular-nums">{value}</span>;
}

export default async function AssetsPage(props: PageProps<"/assets">) {
  const searchParams = await props.searchParams;

  const filters: AssetFilters = {
    assetType: parseEnum<AssetType>(searchParams.type, assetTypeValues),
    ownershipType: parseEnum<OwnershipType>(
      searchParams.ownership,
      ownershipTypeValues,
    ),
    status: parseEnum<AssetStatus>(searchParams.status, statusValues),
  };

  const assets = await getAssets(filters);
  const isFiltered =
    !!filters.assetType || !!filters.ownershipType || !!filters.status;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Assets
          </h1>
          <p className="text-sm text-muted-foreground">
            Every property, profile and product that shapes the entity.
          </p>
        </div>
        <Button render={<Link href="/assets/new" />} className="self-start">
          <PlusIcon />
          New asset
        </Button>
      </div>

      <div className="mb-5">
        <AssetsFilters />
      </div>

      {assets.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <LayersIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">
                {isFiltered ? "No assets match your filters" : "No assets yet"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {isFiltered
                  ? "Try clearing or changing the filters above."
                  : "Add your first asset to start mapping the entity."}
              </p>
            </div>
            {!isFiltered ? (
              <Button render={<Link href="/assets/new" />}>
                <PlusIcon />
                New asset
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Authority</TableHead>
                <TableHead className="text-right">Consistency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {asset.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {assetTypeLabels[asset.assetType as AssetType]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {asset.ownershipType
                      ? ownershipTypeLabels[
                          asset.ownershipType as OwnershipType
                        ]
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusBadgeVariant[asset.status as AssetStatus]}
                    >
                      {statusLabels[asset.status as AssetStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ScoreCell value={asset.authorityScore} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ScoreCell value={asset.consistencyScore} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        {assets.length} {assets.length === 1 ? "asset" : "assets"}
        {isFiltered ? " matching filters" : ""}
      </p>
    </main>
  );
}
