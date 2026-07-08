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
import { createEvidence, updateEvidence } from "./actions";
import {
  evidenceFormSchema,
  evidenceStatusLabels,
  evidenceStatusValues,
  evidenceStrengthLabels,
  evidenceStrengthValues,
  sourceTypeLabels,
  sourceTypeValues,
  toOptions,
  type EvidenceFormValues,
} from "./schema";

const NONE = { value: "", label: "None" };

const sourceTypeItems = toOptions(sourceTypeValues, sourceTypeLabels);
const strengthItems = toOptions(evidenceStrengthValues, evidenceStrengthLabels);
const statusItems = toOptions(evidenceStatusValues, evidenceStatusLabels);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function EvidenceForm({
  mode,
  evidenceId,
  defaultValues,
  claimOptions,
  assetOptions,
}: {
  mode: "create" | "edit";
  evidenceId?: number;
  defaultValues: EvidenceFormValues;
  claimOptions: { id: number; claimText: string }[];
  assetOptions: { id: number; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();

  const claimItems = [
    NONE,
    ...claimOptions.map((c) => ({ value: String(c.id), label: c.claimText })),
  ];
  const assetItems = [
    NONE,
    ...assetOptions.map((a) => ({ value: String(a.id), label: a.name })),
  ];

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<EvidenceFormValues>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues,
  });

  function onSubmit(values: EvidenceFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && evidenceId != null
          ? await updateEvidence(evidenceId, values)
          : await createEvidence(values);

      if (result && !result.ok) {
        if (result.fieldErrors) {
          for (const [name, message] of Object.entries(result.fieldErrors)) {
            setError(name as keyof EvidenceFormValues, { message });
          }
        }
        toast.error(result.message);
      }
    });
  }

  const cancelHref =
    mode === "edit" && evidenceId != null ? `/evidence/${evidenceId}` : "/evidence";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
          <CardDescription>
            A source that supports (or contradicts) a claim or asset.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Waves team page listing"
              aria-invalid={errors.title ? true : undefined}
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              type="url"
              placeholder="https://example.com/page"
              aria-invalid={errors.sourceUrl ? true : undefined}
              {...register("sourceUrl")}
            />
            <FieldError message={errors.sourceUrl?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Source type</Label>
              <Controller
                control={control}
                name="sourceType"
                render={({ field }) => (
                  <Select
                    items={sourceTypeItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Source type">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceTypeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.sourceType?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Strength</Label>
              <Controller
                control={control}
                name="evidenceStrength"
                render={({ field }) => (
                  <Select
                    items={strengthItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Evidence strength">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {strengthItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.evidenceStrength?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="evidenceStatus"
                render={({ field }) => (
                  <Select
                    items={statusItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Evidence status">
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
              <FieldError message={errors.evidenceStatus?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quoteOrSummary">Quote or summary</Label>
            <Textarea
              id="quoteOrSummary"
              rows={4}
              placeholder="Paste the supporting quote or summarise the source…"
              {...register("quoteOrSummary")}
            />
            <FieldError message={errors.quoteOrSummary?.message} />
          </div>

          <div className="flex flex-col gap-1.5 sm:max-w-56">
            <Label htmlFor="datePublished">Date published</Label>
            <Input
              id="datePublished"
              type="date"
              aria-invalid={errors.datePublished ? true : undefined}
              {...register("datePublished")}
            />
            <FieldError message={errors.datePublished?.message} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
          <CardDescription>
            Link to at least one claim or asset — evidence can&apos;t be
            orphaned.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Linked claim</Label>
              <Controller
                control={control}
                name="claimId"
                render={({ field }) => (
                  <Select
                    items={claimItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Linked claim">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {claimItems.map((item) => (
                        <SelectItem key={item.value || "none"} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Linked asset</Label>
              <Controller
                control={control}
                name="assetId"
                render={({ field }) => (
                  <Select
                    items={assetItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Linked asset">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetItems.map((item) => (
                        <SelectItem key={item.value || "none"} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <FieldError message={errors.claimId?.message} />

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
        <Button type="button" variant="ghost" render={<Link href={cancelHref} />}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "edit"
              ? "Save changes"
              : "Create evidence"}
        </Button>
      </div>
    </form>
  );
}
