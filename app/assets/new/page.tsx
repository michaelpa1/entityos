import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AssetForm } from "../asset-form";
import { emptyAssetForm } from "../schema";

export default function NewAssetPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/assets" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Assets
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            New asset
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a property, profile or product to the entity.
          </p>
        </div>
      </div>

      <AssetForm mode="create" defaultValues={emptyAssetForm} />
    </main>
  );
}
