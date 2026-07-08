"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAsset, updateAsset } from "./actions";
import {
  assetFormSchema,
  assetTypeLabels,
  assetTypeValues,
  entityRoleLabels,
  entityRoleValues,
  ownershipTypeLabels,
  ownershipTypeValues,
  statusLabels,
  statusValues,
  toOptions,
  type AssetFormValues,
} from "./schema";

const NONE = { value: "", label: "None" };

const assetTypeItems = toOptions(assetTypeValues, assetTypeLabels);
const statusItems = toOptions(statusValues, statusLabels);
const ownershipItems = [NONE, ...toOptions(ownershipTypeValues, ownershipTypeLabels)];
const entityRoleItems = [NONE, ...toOptions(entityRoleValues, entityRoleLabels)];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function AssetForm({
  mode,
  assetId,
  defaultValues,
}: {
  mode: "create" | "edit";
  assetId?: number;
  defaultValues: AssetFormValues;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues,
  });

  function onSubmit(values: AssetFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && assetId != null
          ? await updateAsset(assetId, values)
          : await createAsset(values);

      // A successful action redirects (throws), so we only get here on error.
      if (result && !result.ok) {
        if (result.fieldErrors) {
          for (const [name, message] of Object.entries(result.fieldErrors)) {
            setError(name as keyof AssetFormValues, { message });
          }
        }
        toast.error(result.message);
      }
    });
  }

  const cancelHref = mode === "edit" && assetId != null ? `/assets/${assetId}` : "/assets";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>What the asset is and where it lives.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="michaelpa.com"
              aria-invalid={errors.name ? true : undefined}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Asset type</Label>
              <Controller
                control={control}
                name="assetType"
                render={({ field }) => (
                  <Select
                    items={assetTypeItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Asset type">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.assetType?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                aria-invalid={errors.url ? true : undefined}
                {...register("url")}
              />
              <FieldError message={errors.url?.message} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
          <CardDescription>
            How this asset is owned and its role in the entity graph.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Ownership</Label>
              <Controller
                control={control}
                name="ownershipType"
                render={({ field }) => (
                  <Select
                    items={ownershipItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Ownership type">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownershipItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.ownershipType?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Entity role</Label>
              <Controller
                control={control}
                name="entityRole"
                render={({ field }) => (
                  <Select
                    items={entityRoleItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Entity role">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityRoleItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.entityRole?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    items={statusItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Status">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.status?.message} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="authorityScore">Authority score (0–100)</Label>
              <Input
                id="authorityScore"
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                placeholder="0–100"
                aria-invalid={errors.authorityScore ? true : undefined}
                {...register("authorityScore")}
              />
              <FieldError message={errors.authorityScore?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="consistencyScore">Consistency score (0–100)</Label>
              <Input
                id="consistencyScore"
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                placeholder="0–100"
                aria-invalid={errors.consistencyScore ? true : undefined}
                {...register("consistencyScore")}
              />
              <FieldError message={errors.consistencyScore?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Anything worth remembering about this asset…"
              {...register("notes")}
            />
            <FieldError message={errors.notes?.message} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" render={<Link href={cancelHref} />}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "edit"
              ? "Save changes"
              : "Create asset"}
        </Button>
      </div>
    </form>
  );
}
