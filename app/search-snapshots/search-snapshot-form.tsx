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
import { Checkbox } from "@/components/ui/checkbox";
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
import { createSearchSnapshot, updateSearchSnapshot } from "./actions";
import {
  deviceLabels,
  deviceValues,
  searchEngineLabels,
  searchEngineValues,
  searchSnapshotFormSchema,
  toOptions,
  type SearchSnapshotFormValues,
} from "./schema";

const searchEngineItems = toOptions(searchEngineValues, searchEngineLabels);
const deviceItems = toOptions(deviceValues, deviceLabels);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function SearchSnapshotForm({
  mode,
  snapshotId,
  defaultValues,
}: {
  mode: "create" | "edit";
  snapshotId?: number;
  defaultValues: SearchSnapshotFormValues;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<SearchSnapshotFormValues>({
    resolver: zodResolver(searchSnapshotFormSchema),
    defaultValues,
  });

  function onSubmit(values: SearchSnapshotFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && snapshotId != null
          ? await updateSearchSnapshot(snapshotId, values)
          : await createSearchSnapshot(values);

      if (result && !result.ok) {
        if (result.fieldErrors) {
          for (const [name, message] of Object.entries(result.fieldErrors)) {
            setError(name as keyof SearchSnapshotFormValues, { message });
          }
        }
        toast.error(result.message);
      }
    });
  }

  const cancelHref =
    mode === "edit" && snapshotId != null
      ? `/search-snapshots/${snapshotId}`
      : "/search-snapshots";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Search snapshot</CardTitle>
          <CardDescription>
            A record of how the entity appears in a search engine result page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Search engine</Label>
              <Controller
                control={control}
                name="searchEngine"
                render={({ field }) => (
                  <Select
                    items={searchEngineItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Search engine">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchEngineItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.searchEngine?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Device</Label>
              <Controller
                control={control}
                name="device"
                render={({ field }) => (
                  <Select
                    items={deviceItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Device">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.device?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="query">Query</Label>
            <Input
              id="query"
              placeholder="michael pearson-adams"
              aria-invalid={errors.query ? true : undefined}
              {...register("query")}
            />
            <FieldError message={errors.query?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Brisbane, Australia"
                {...register("location")}
              />
              <FieldError message={errors.location?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="snapshotDate">Snapshot date</Label>
              <Input
                id="snapshotDate"
                type="date"
                aria-invalid={errors.snapshotDate ? true : undefined}
                {...register("snapshotDate")}
              />
              <FieldError message={errors.snapshotDate?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <Controller
              control={control}
              name="hasKnowledgePanel"
              render={({ field }) => (
                <label className="flex w-fit items-center gap-2.5 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                  <span>Has knowledge panel</span>
                </label>
              )}
            />
            <Controller
              control={control}
              name="hasAiOverview"
              render={({ field }) => (
                <label className="flex w-fit items-center gap-2.5 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                  <span>Has AI overview</span>
                </label>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top result & observations</CardTitle>
          <CardDescription>
            What ranked first and what you observed on the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topResultTitle">Top result title</Label>
            <Input
              id="topResultTitle"
              placeholder="Michael Pearson-Adams — Official Site"
              {...register("topResultTitle")}
            />
            <FieldError message={errors.topResultTitle?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topResultUrl">Top result URL</Label>
            <Input
              id="topResultUrl"
              type="url"
              placeholder="https://example.com/page"
              aria-invalid={errors.topResultUrl ? true : undefined}
              {...register("topResultUrl")}
            />
            <FieldError message={errors.topResultUrl?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="observedSummary">Observed summary</Label>
            <Textarea
              id="observedSummary"
              rows={4}
              placeholder="Describe what the SERP looked like…"
              {...register("observedSummary")}
            />
            <FieldError message={errors.observedSummary?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="screenshotUrl">Screenshot URL</Label>
            <Input
              id="screenshotUrl"
              type="url"
              placeholder="https://example.com/screenshot.png"
              aria-invalid={errors.screenshotUrl ? true : undefined}
              {...register("screenshotUrl")}
            />
            <FieldError message={errors.screenshotUrl?.message} />
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
        <Button type="button" variant="ghost" render={<Link href={cancelHref} />}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "edit"
              ? "Save changes"
              : "Create snapshot"}
        </Button>
      </div>
    </form>
  );
}
