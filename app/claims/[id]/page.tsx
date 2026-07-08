import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  FileSearchIcon,
  PencilIcon,
  PlusIcon,
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
import { getEvidenceForClaim } from "../../evidence/data";
import {
  evidenceStatusLabels,
  evidenceStrengthLabels,
  statusBadgeVariant,
  strengthBadgeVariant,
  type EvidenceStatus,
  type EvidenceStrength,
} from "../../evidence/schema";
import { getClaim } from "../data";
import {
  claimTypeLabels,
  confidenceBadgeVariant,
  confidenceLabels,
  publicImportanceBadgeVariant,
  publicImportanceLabels,
  type ClaimType,
  type Confidence,
  type PublicImportance,
} from "../schema";
import { DeleteClaimDialog } from "./delete-claim";

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

export default async function ClaimDetailPage(
  props: PageProps<"/claims/[id]">,
) {
  const { id } = await props.params;
  const claimId = Number(id);
  const claim = await getClaim(claimId);

  if (!claim) {
    notFound();
  }

  const linkedEvidence = await getEvidenceForClaim(claimId);
  const confidence = claim.confidence as Confidence;
  const importance = claim.publicImportance as PublicImportance;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/claims" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Claims
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {claim.claimText}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {claimTypeLabels[claim.claimType as ClaimType]}
            </Badge>
            <Badge variant={confidenceBadgeVariant[confidence]}>
              {confidenceLabels[confidence]}
            </Badge>
            <Badge variant={publicImportanceBadgeVariant[importance]}>
              {publicImportanceLabels[importance]} importance
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/claims/${claim.id}/edit`} />}
          >
            <PencilIcon />
            Edit
          </Button>
          <DeleteClaimDialog claimId={claim.id} claimText={claim.claimText} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Everything recorded about this claim.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <Row label="Claim text">{claim.claimText}</Row>
              <Row label="Claim type">
                {claimTypeLabels[claim.claimType as ClaimType]}
              </Row>
              <Row label="Confidence">
                <Badge variant={confidenceBadgeVariant[confidence]}>
                  {confidenceLabels[confidence]}
                </Badge>
              </Row>
              <Row label="Public importance">
                <Badge variant={publicImportanceBadgeVariant[importance]}>
                  {publicImportanceLabels[importance]}
                </Badge>
              </Row>
              <Row label="Should be public">
                {claim.shouldBePublic ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <XIcon className="size-4" />
                    No
                  </span>
                )}
              </Row>
              <Row label="Notes">
                {claim.notes ? (
                  <span className="whitespace-pre-wrap">{claim.notes}</span>
                ) : (
                  <NotSet />
                )}
              </Row>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearchIcon className="size-4 text-muted-foreground" />
              Linked evidence
              <Badge variant="muted" className="ml-1">
                {linkedEvidence.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Evidence that references this claim.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {linkedEvidence.length === 0 ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted-foreground/70 italic">
                  No evidence linked to this claim yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/evidence/new" />}
                >
                  <PlusIcon />
                  Add evidence
                </Button>
              </div>
            ) : (
              linkedEvidence.map((item) => (
                <Link
                  key={item.id}
                  href={`/evidence/${item.id}`}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="flex shrink-0 items-center gap-2">
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
                    <Badge
                      variant={
                        statusBadgeVariant[item.evidenceStatus as EvidenceStatus]
                      }
                    >
                      {evidenceStatusLabels[item.evidenceStatus as EvidenceStatus]}
                    </Badge>
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
