import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getClaimOptions } from "../../../claims/data";
import { EvidenceForm } from "../../evidence-form";
import { getAssetOptions, getEvidenceItem } from "../../data";
import {
  type EvidenceFormValues,
  type EvidenceStatus,
  type EvidenceStrength,
  type SourceType,
} from "../../schema";

export const dynamic = "force-dynamic";

function toDateInput(value: Date | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default async function EditEvidencePage(
  props: PageProps<"/evidence/[id]/edit">,
) {
  const { id } = await props.params;
  const [item, claimOptions, assetOptions] = await Promise.all([
    getEvidenceItem(Number(id)),
    getClaimOptions(),
    getAssetOptions(),
  ]);

  if (!item) {
    notFound();
  }

  const defaultValues: EvidenceFormValues = {
    title: item.title,
    sourceUrl: item.sourceUrl ?? "",
    sourceType: item.sourceType as SourceType,
    evidenceStrength: item.evidenceStrength as EvidenceStrength,
    evidenceStatus: item.evidenceStatus as EvidenceStatus,
    quoteOrSummary: item.quoteOrSummary ?? "",
    datePublished: toDateInput(item.datePublished),
    claimId: item.claimId != null ? String(item.claimId) : "",
    assetId: item.assetId != null ? String(item.assetId) : "",
    notes: item.notes ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/evidence/${item.id}`} />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to evidence
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit evidence
          </h1>
          <p className="text-sm text-muted-foreground">
            Update details for {item.title}.
          </p>
        </div>
      </div>

      <EvidenceForm
        mode="edit"
        evidenceId={item.id}
        defaultValues={defaultValues}
        claimOptions={claimOptions}
        assetOptions={assetOptions}
      />
    </main>
  );
}
