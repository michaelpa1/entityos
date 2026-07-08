import Link from "next/link";
import { PlusIcon, FileSearchIcon } from "lucide-react";

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
import { EvidenceFilters } from "./evidence-filters";
import { getEvidenceList, type EvidenceFilters as Filters } from "./data";
import {
  evidenceStatusValues,
  evidenceStrengthValues,
  sourceTypeLabels,
  sourceTypeValues,
  statusBadgeVariant,
  strengthBadgeVariant,
  evidenceStatusLabels,
  evidenceStrengthLabels,
  type EvidenceStatus,
  type EvidenceStrength,
  type SourceType,
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

function LinkedTo({
  claimId,
  claimText,
  assetId,
  assetName,
}: {
  claimId: number | null;
  claimText: string | null;
  assetId: number | null;
  assetName: string | null;
}) {
  if (!claimText && !assetName) {
    return <span className="text-muted-foreground/60">—</span>;
  }
  return (
    <div className="flex flex-col gap-1">
      {claimText ? (
        <Link
          href={`/claims/${claimId}`}
          className="text-xs underline-offset-4 hover:underline"
        >
          <span className="text-muted-foreground">Claim:</span> {claimText}
        </Link>
      ) : null}
      {assetName ? (
        <Link
          href={`/assets/${assetId}`}
          className="text-xs underline-offset-4 hover:underline"
        >
          <span className="text-muted-foreground">Asset:</span> {assetName}
        </Link>
      ) : null}
    </div>
  );
}

export default async function EvidencePage(props: PageProps<"/evidence">) {
  const searchParams = await props.searchParams;

  const filters: Filters = {
    sourceType: parseEnum<SourceType>(searchParams.source, sourceTypeValues),
    evidenceStrength: parseEnum<EvidenceStrength>(
      searchParams.strength,
      evidenceStrengthValues,
    ),
    evidenceStatus: parseEnum<EvidenceStatus>(
      searchParams.status,
      evidenceStatusValues,
    ),
  };

  const items = await getEvidenceList(filters);
  const isFiltered =
    !!filters.sourceType ||
    !!filters.evidenceStrength ||
    !!filters.evidenceStatus;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Evidence
          </h1>
          <p className="text-sm text-muted-foreground">
            Sources that back up claims and assets.
          </p>
        </div>
        <Button render={<Link href="/evidence/new" />} className="self-start">
          <PlusIcon />
          New evidence
        </Button>
      </div>

      <div className="mb-5">
        <EvidenceFilters />
      </div>

      {items.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileSearchIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">
                {isFiltered
                  ? "No evidence matches your filters"
                  : "No evidence yet"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {isFiltered
                  ? "Try clearing or changing the filters above."
                  : "Add evidence and link it to a claim or asset."}
              </p>
            </div>
            {!isFiltered ? (
              <Button render={<Link href="/evidence/new" />}>
                <PlusIcon />
                New evidence
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
                <TableHead>Source</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Linked to</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-xs font-medium whitespace-normal">
                    <Link
                      href={`/evidence/${item.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sourceTypeLabels[item.sourceType as SourceType]}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        strengthBadgeVariant[
                          item.evidenceStrength as EvidenceStrength
                        ]
                      }
                    >
                      {
                        evidenceStrengthLabels[
                          item.evidenceStrength as EvidenceStrength
                        ]
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusBadgeVariant[item.evidenceStatus as EvidenceStatus]
                      }
                    >
                      {evidenceStatusLabels[item.evidenceStatus as EvidenceStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <LinkedTo
                      claimId={item.claimId}
                      claimText={item.claimText}
                      assetId={item.assetId}
                      assetName={item.assetName}
                    />
                  </TableCell>
                </TableRow>
              ))}
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
