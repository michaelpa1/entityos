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
import { createClaim, updateClaim } from "./actions";
import {
  claimFormSchema,
  claimTypeLabels,
  claimTypeValues,
  confidenceLabels,
  confidenceValues,
  publicImportanceLabels,
  publicImportanceValues,
  toOptions,
  type ClaimFormValues,
} from "./schema";

const claimTypeItems = toOptions(claimTypeValues, claimTypeLabels);
const confidenceItems = toOptions(confidenceValues, confidenceLabels);
const importanceItems = toOptions(publicImportanceValues, publicImportanceLabels);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function ClaimForm({
  mode,
  claimId,
  defaultValues,
}: {
  mode: "create" | "edit";
  claimId?: number;
  defaultValues: ClaimFormValues;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues,
  });

  function onSubmit(values: ClaimFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && claimId != null
          ? await updateClaim(claimId, values)
          : await createClaim(values);

      if (result && !result.ok) {
        if (result.fieldErrors) {
          for (const [name, message] of Object.entries(result.fieldErrors)) {
            setError(name as keyof ClaimFormValues, { message });
          }
        }
        toast.error(result.message);
      }
    });
  }

  const cancelHref =
    mode === "edit" && claimId != null ? `/claims/${claimId}` : "/claims";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Claim</CardTitle>
          <CardDescription>
            A statement about the entity and how strongly it&apos;s supported.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="claimText">Claim text</Label>
            <Input
              id="claimText"
              placeholder="Product Manager at Waves Audio"
              aria-invalid={errors.claimText ? true : undefined}
              {...register("claimText")}
            />
            <FieldError message={errors.claimText?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Claim type</Label>
              <Controller
                control={control}
                name="claimType"
                render={({ field }) => (
                  <Select
                    items={claimTypeItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Claim type">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {claimTypeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.claimType?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Confidence</Label>
              <Controller
                control={control}
                name="confidence"
                render={({ field }) => (
                  <Select
                    items={confidenceItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Confidence">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {confidenceItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.confidence?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Public importance</Label>
              <Controller
                control={control}
                name="publicImportance"
                render={({ field }) => (
                  <Select
                    items={importanceItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger aria-label="Public importance">
                      <SelectValue data-slot="select-value" />
                    </SelectTrigger>
                    <SelectContent>
                      {importanceItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.publicImportance?.message} />
            </div>
          </div>

          <Controller
            control={control}
            name="shouldBePublic"
            render={({ field }) => (
              <label className="flex w-fit items-center gap-2.5 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <span>Should be public</span>
              </label>
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Context, caveats or follow-ups…"
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
              : "Create claim"}
        </Button>
      </div>
    </form>
  );
}
