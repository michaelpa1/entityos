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
import { createAiSnapshot, updateAiSnapshot } from "./actions";
import {
  aiProviderLabels,
  aiProviderValues,
  aiSnapshotFormSchema,
  toOptions,
  type AiSnapshotFormValues,
} from "./schema";

const providerItems = toOptions(aiProviderValues, aiProviderLabels);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function AiSnapshotForm({
  mode,
  snapshotId,
  defaultValues,
}: {
  mode: "create" | "edit";
  snapshotId?: number;
  defaultValues: AiSnapshotFormValues;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<AiSnapshotFormValues>({
    resolver: zodResolver(aiSnapshotFormSchema),
    defaultValues,
  });

  function onSubmit(values: AiSnapshotFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && snapshotId != null
          ? await updateAiSnapshot(snapshotId, values)
          : await createAiSnapshot(values);

      if (result && !result.ok) {
        if (result.fieldErrors) {
          for (const [name, message] of Object.entries(result.fieldErrors)) {
            setError(name as keyof AiSnapshotFormValues, { message });
          }
        }
        toast.error(result.message);
      }
    });
  }

  const cancelHref =
    mode === "edit" && snapshotId != null
      ? `/ai-snapshots/${snapshotId}`
      : "/ai-snapshots";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI snapshot</CardTitle>
          <CardDescription>
            A record of how an AI assistant describes the entity for a prompt.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Controller
                control={control}
                name="provider"
                render={({ field }) => (
                  <Select
                    items={providerItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Provider">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {providerItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.provider?.message} />
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              rows={3}
              placeholder="Who is Michael Pearson-Adams?"
              aria-invalid={errors.prompt ? true : undefined}
              {...register("prompt")}
            />
            <FieldError message={errors.prompt?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="responseSummary">Response summary</Label>
            <Textarea
              id="responseSummary"
              rows={4}
              placeholder="Summarise what the assistant said…"
              {...register("responseSummary")}
            />
            <FieldError message={errors.responseSummary?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullResponse">Full response</Label>
            <Textarea
              id="fullResponse"
              rows={6}
              placeholder="Paste the full response…"
              {...register("fullResponse")}
            />
            <FieldError message={errors.fullResponse?.message} />
          </div>

          <div className="flex flex-col gap-1.5 sm:max-w-56">
            <Label htmlFor="confidenceScore">Confidence score (0–100)</Label>
            <Input
              id="confidenceScore"
              type="number"
              min={0}
              max={100}
              placeholder="Optional"
              aria-invalid={errors.confidenceScore ? true : undefined}
              {...register("confidenceScore")}
            />
            <FieldError message={errors.confidenceScore?.message} />
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
