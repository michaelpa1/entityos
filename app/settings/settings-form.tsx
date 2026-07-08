"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
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
import { updateSettings } from "./actions";
import {
  settingsFormSchema,
  type SettingsFormValues,
} from "./schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function SettingsForm({
  defaultValues,
}: {
  defaultValues: SettingsFormValues;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  function onSubmit(values: SettingsFormValues) {
    startTransition(async () => {
      const result = await updateSettings(values);
      if (result.ok) {
        toast.success("Settings saved.");
        return;
      }
      if (result.fieldErrors) {
        for (const [name, message] of Object.entries(result.fieldErrors)) {
          setError(name as keyof SettingsFormValues, { message });
        }
      }
      toast.error(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard scores</CardTitle>
          <CardDescription>
            Manual overrides for visibility metrics on the dashboard. Leave at
            50 until you have real snapshot data to score against.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="searchVisibilityHealth">
                Search Visibility Health (0–100)
              </Label>
              <Input
                id="searchVisibilityHealth"
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                placeholder="50"
                aria-invalid={errors.searchVisibilityHealth ? true : undefined}
                {...register("searchVisibilityHealth")}
              />
              <FieldError message={errors.searchVisibilityHealth?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aiVisibilityHealth">
                AI Visibility Health (0–100)
              </Label>
              <Input
                id="aiVisibilityHealth"
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                placeholder="50"
                aria-invalid={errors.aiVisibilityHealth ? true : undefined}
                {...register("aiVisibilityHealth")}
              />
              <FieldError message={errors.aiVisibilityHealth?.message} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
