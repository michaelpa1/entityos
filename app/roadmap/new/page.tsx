import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAssetOptions, getClaimOptions } from "../data";
import { RoadmapForm } from "../roadmap-form";
import { emptyRoadmapForm } from "../schema";

export const dynamic = "force-dynamic";

export default async function NewRoadmapItemPage() {
  const [assetOptions, claimOptions] = await Promise.all([
    getAssetOptions(),
    getClaimOptions(),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/roadmap" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Roadmap
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            New roadmap item
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a task to the plan.
          </p>
        </div>
      </div>

      <RoadmapForm
        mode="create"
        defaultValues={emptyRoadmapForm}
        assetOptions={assetOptions}
        claimOptions={claimOptions}
      />
    </main>
  );
}
