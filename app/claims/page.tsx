import Link from "next/link";
import { PlusIcon, MessageSquareQuoteIcon, EyeOffIcon } from "lucide-react";

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
import { ClaimsFilters } from "./claims-filters";
import { getClaims, type ClaimFilters } from "./data";
import {
  claimTypeLabels,
  claimTypeValues,
  confidenceBadgeVariant,
  confidenceLabels,
  confidenceValues,
  publicImportanceBadgeVariant,
  publicImportanceLabels,
  publicImportanceValues,
  type ClaimType,
  type Confidence,
  type PublicImportance,
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

export default async function ClaimsPage(props: PageProps<"/claims">) {
  const searchParams = await props.searchParams;

  const filters: ClaimFilters = {
    claimType: parseEnum<ClaimType>(searchParams.type, claimTypeValues),
    confidence: parseEnum<Confidence>(searchParams.confidence, confidenceValues),
    publicImportance: parseEnum<PublicImportance>(
      searchParams.importance,
      publicImportanceValues,
    ),
  };

  const claims = await getClaims(filters);
  const isFiltered =
    !!filters.claimType || !!filters.confidence || !!filters.publicImportance;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Claims
          </h1>
          <p className="text-sm text-muted-foreground">
            Statements about the entity, ranked by confidence and importance.
          </p>
        </div>
        <Button render={<Link href="/claims/new" />} className="self-start">
          <PlusIcon />
          New claim
        </Button>
      </div>

      <div className="mb-5">
        <ClaimsFilters />
      </div>

      {claims.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquareQuoteIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">
                {isFiltered ? "No claims match your filters" : "No claims yet"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {isFiltered
                  ? "Try clearing or changing the filters above."
                  : "Add your first claim to start mapping the entity."}
              </p>
            </div>
            {!isFiltered ? (
              <Button render={<Link href="/claims/new" />}>
                <PlusIcon />
                New claim
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Claim</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead className="text-right">Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="max-w-xs font-medium whitespace-normal">
                    <Link
                      href={`/claims/${claim.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {claim.claimText}
                    </Link>
                    {!claim.shouldBePublic ? (
                      <EyeOffIcon
                        className="ml-1.5 inline size-3.5 text-muted-foreground"
                        aria-label="Not public"
                      />
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {claimTypeLabels[claim.claimType as ClaimType]}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        confidenceBadgeVariant[claim.confidence as Confidence]
                      }
                    >
                      {confidenceLabels[claim.confidence as Confidence]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        publicImportanceBadgeVariant[
                          claim.publicImportance as PublicImportance
                        ]
                      }
                    >
                      {
                        publicImportanceLabels[
                          claim.publicImportance as PublicImportance
                        ]
                      }
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {claim.evidenceCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        {claims.length} {claims.length === 1 ? "claim" : "claims"}
        {isFiltered ? " matching filters" : ""}
      </p>
    </main>
  );
}
