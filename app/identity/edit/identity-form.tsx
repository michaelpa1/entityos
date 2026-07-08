"use client";

import { useTransition } from "react";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import { saveIdentity } from "../actions";
import {
  fieldGroups,
  identitySchema,
  type IdentityFormValues,
} from "../schema";

export function IdentityForm({
  defaultValues,
}: {
  defaultValues: IdentityFormValues;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues,
  });

  function onSubmit(values: IdentityFormValues) {
    startTransition(async () => {
      const result = await saveIdentity(values);
      if (result && !result.ok) {
        if (result.fieldErrors) {
          for (const [name, message] of Object.entries(result.fieldErrors)) {
            setError(name as keyof IdentityFormValues, { message });
          }
        }
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {fieldGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {group.fields.map((field) => {
              const error = errors[field.name]?.message;
              const inputId = `field-${field.name}`;
              return (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <Label htmlFor={inputId}>{field.label}</Label>
                  {field.description ? (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  ) : null}
                  {field.kind === "textarea" ? (
                    <Textarea
                      id={inputId}
                      rows={field.rows}
                      placeholder={field.placeholder}
                      aria-invalid={error ? true : undefined}
                      {...register(field.name)}
                    />
                  ) : (
                    <Input
                      id={inputId}
                      type={field.kind === "url" ? "url" : "text"}
                      placeholder={field.placeholder}
                      aria-invalid={error ? true : undefined}
                      {...register(field.name)}
                    />
                  )}
                  {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          render={<Link href="/identity" />}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
