import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getAssetOptions,
  getClaimOptions,
  getRoadmapItem,
} from "../../data";
import { RoadmapForm } from "../../roadmap-form";
import {
  type Category,
  type Effort,
  type Impact,
  type Priority,
  type RoadmapFormValues,
  type Status,
} from "../../schema";
import { DeleteRoadmapItemDialog } from "../delete-roadmap-item";

export const dynamic = "force-dynamic";

function toDateInput(value: Date | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default async function EditRoadmapItemPage(
  props: PageProps<"/roadmap/[id]/edit">,
) {
  const { id } = await props.params;
  const [item, assetOptions, claimOptions] = await Promise.all([
    getRoadmapItem(Number(id)),
    getAssetOptions(),
    getClaimOptions(),
  ]);

  if (!item) {
    notFound();
  }

  const defaultValues: RoadmapFormValues = {
    title: item.title,
    description: item.description ?? "",
    category: item.category as Category,
    priority: item.priority as Priority,
    status: item.status as Status,
    impact: item.impact as Impact,
    effort: item.effort as Effort,
    dueDate: toDateInput(item.dueDate),
    relatedAssetId: item.relatedAssetId ? String(item.relatedAssetId) : "",
    relatedClaimId: item.relatedClaimId ? String(item.relatedClaimId) : "",
    notes: item.notes ?? "",
  };

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Edit roadmap item
            </h1>
            <p className="text-sm text-muted-foreground">
              Update details for {item.title}.
            </p>
          </div>
          <div className="shrink-0">
            <DeleteRoadmapItemDialog itemId={item.id} title={item.title} />
          </div>
        </div>
      </div>

      <RoadmapForm
        mode="edit"
        itemId={item.id}
        defaultValues={defaultValues}
        assetOptions={assetOptions}
        claimOptions={claimOptions}
      />
    </main>
  );
}
