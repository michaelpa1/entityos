import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AssetForm } from "../../asset-form";
import { getAsset } from "../../data";
import {
  type AssetFormValues,
  type AssetStatus,
  type AssetType,
  type EntityRole,
  type OwnershipType,
} from "../../schema";

export const dynamic = "force-dynamic";

export default async function EditAssetPage(
  props: PageProps<"/assets/[id]/edit">,
) {
  const { id } = await props.params;
  const asset = await getAsset(Number(id));

  if (!asset) {
    notFound();
  }

  const defaultValues: AssetFormValues = {
    name: asset.name,
    assetType: asset.assetType as AssetType,
    url: asset.url ?? "",
    ownershipType: (asset.ownershipType as OwnershipType | null) ?? "",
    entityRole: (asset.entityRole as EntityRole | null) ?? "",
    status: asset.status as AssetStatus,
    authorityScore: asset.authorityScore?.toString() ?? "",
    consistencyScore: asset.consistencyScore?.toString() ?? "",
    notes: asset.notes ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/assets/${asset.id}`} />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to asset
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit asset
          </h1>
          <p className="text-sm text-muted-foreground">
            Update details for {asset.name}.
          </p>
        </div>
      </div>

      <AssetForm
        mode="edit"
        assetId={asset.id}
        defaultValues={defaultValues}
      />
    </main>
  );
}
