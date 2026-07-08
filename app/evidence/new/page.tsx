import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getClaimOptions } from "../../claims/data";
import { EvidenceForm } from "../evidence-form";
import { getAssetOptions } from "../data";
import { emptyEvidenceForm } from "../schema";

export const dynamic = "force-dynamic";

export default async function NewEvidencePage() {
  const [claimOptions, assetOptions] = await Promise.all([
    getClaimOptions(),
    getAssetOptions(),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/evidence" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Evidence
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            New evidence
          </h1>
          <p className="text-sm text-muted-foreground">
            Capture a source and link it to a claim or asset.
          </p>
        </div>
      </div>

      <EvidenceForm
        mode="create"
        defaultValues={emptyEvidenceForm}
        claimOptions={claimOptions}
        assetOptions={assetOptions}
      />
    </main>
  );
}
