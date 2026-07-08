import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClaimForm } from "../../claim-form";
import { getClaim } from "../../data";
import {
  type ClaimFormValues,
  type ClaimType,
  type Confidence,
  type PublicImportance,
} from "../../schema";

export const dynamic = "force-dynamic";

export default async function EditClaimPage(
  props: PageProps<"/claims/[id]/edit">,
) {
  const { id } = await props.params;
  const claim = await getClaim(Number(id));

  if (!claim) {
    notFound();
  }

  const defaultValues: ClaimFormValues = {
    claimText: claim.claimText,
    claimType: claim.claimType as ClaimType,
    confidence: claim.confidence as Confidence,
    publicImportance: claim.publicImportance as PublicImportance,
    shouldBePublic: claim.shouldBePublic,
    notes: claim.notes ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/claims/${claim.id}`} />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to claim
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit claim
          </h1>
          <p className="text-sm text-muted-foreground">
            Update this claim&apos;s details.
          </p>
        </div>
      </div>

      <ClaimForm mode="edit" claimId={claim.id} defaultValues={defaultValues} />
    </main>
  );
}
