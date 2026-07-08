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
import { createRoadmapItem, updateRoadmapItem } from "./actions";
import {
  categoryLabels,
  categoryValues,
  effortLabels,
  effortValues,
  impactLabels,
  impactValues,
  priorityLabels,
  priorityValues,
  roadmapFormSchema,
  statusLabels,
  statusValues,
  toOptions,
  type RoadmapFormValues,
} from "./schema";

const NONE = { value: "", label: "None" };

const categoryItems = toOptions(categoryValues, categoryLabels);
const priorityItems = toOptions(priorityValues, priorityLabels);
const statusItems = toOptions(statusValues, statusLabels);
const impactItems = toOptions(impactValues, impactLabels);
const effortItems = toOptions(effortValues, effortLabels);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function SelectField({
  control,
  name,
  label,
  items,
  error,
}: {
  control: ReturnType<typeof useForm<RoadmapFormValues>>["control"];
  name: keyof RoadmapFormValues;
  label: string;
  items: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            items={items}
            value={field.value}
            onValueChange={(value) => field.onChange(value ?? "")}
          >
            <SelectTrigger aria-label={label}>
              <SelectValue data-slot="select-value" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value || "none"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FieldError message={error} />
    </div>
  );
}

export function RoadmapForm({
  mode,
  itemId,
  defaultValues,
  assetOptions,
  claimOptions,
}: {
  mode: "create" | "edit";
  itemId?: number;
  defaultValues: RoadmapFormValues;
  assetOptions: { id: number; name: string }[];
  claimOptions: { id: number; claimText: string }[];
}) {
  const [isPending, startTransition] = useTransition();

  const assetItems = [
    NONE,
    ...assetOptions.map((a) => ({ value: String(a.id), label: a.name })),
  ];
  const claimItems = [
    NONE,
    ...claimOptions.map((c) => ({ value: String(c.id), label: c.claimText })),
  ];

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<RoadmapFormValues>({
    resolver: zodResolver(roadmapFormSchema),
    defaultValues,
  });

  function onSubmit(values: RoadmapFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && itemId != null
          ? await updateRoadmapItem(itemId, values)
          : await createRoadmapItem(values);

      // A successful action redirects (throws), so we only get here on error.
      if (result && !result.ok) {
        if (result.fieldErrors) {
          for (const [name, message] of Object.entries(result.fieldErrors)) {
            setError(name as keyof RoadmapFormValues, { message });
          }
        }
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Task</CardTitle>
          <CardDescription>What needs doing and why.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Publish Person schema on the canonical site"
              aria-invalid={errors.title ? true : undefined}
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="A short summary of the work…"
              {...register("description")}
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              control={control}
              name="category"
              label="Category"
              items={categoryItems}
              error={errors.category?.message}
            />
            <SelectField
              control={control}
              name="priority"
              label="Priority"
              items={priorityItems}
              error={errors.priority?.message}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planning</CardTitle>
          <CardDescription>
            Status, expected impact, effort and timing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <SelectField
              control={control}
              name="status"
              label="Status"
              items={statusItems}
              error={errors.status?.message}
            />
            <SelectField
              control={control}
              name="impact"
              label="Impact"
              items={impactItems}
              error={errors.impact?.message}
            />
            <SelectField
              control={control}
              name="effort"
              label="Effort"
              items={effortItems}
              error={errors.effort?.message}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:max-w-56">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              aria-invalid={errors.dueDate ? true : undefined}
              {...register("dueDate")}
            />
            <FieldError message={errors.dueDate?.message} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
          <CardDescription>
            Optionally connect this task to an asset or claim.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              control={control}
              name="relatedAssetId"
              label="Related asset"
              items={assetItems}
            />
            <SelectField
              control={control}
              name="relatedClaimId"
              label="Related claim"
              items={claimItems}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Anything else worth recording…"
              {...register("notes")}
            />
            <FieldError message={errors.notes?.message} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" render={<Link href="/roadmap" />}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "edit"
              ? "Save changes"
              : "Create roadmap item"}
        </Button>
      </div>
    </form>
  );
}
