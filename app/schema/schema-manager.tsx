"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ExternalLinkIcon,
  PencilIcon,
  PlusIcon,
  TablePropertiesIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createSchemaItem,
  deleteSchemaItem,
  updateSchemaItem,
  updateSchemaStatus,
} from "./actions";
import type { SchemaItemWithAsset } from "./data";
import {
  emptySchemaItemForm,
  schemaItemFormSchema,
  schemaStatusBadgeVariant,
  schemaStatusLabels,
  schemaStatusValues,
  schemaTypeLabels,
  schemaTypeValues,
  toOptions,
  type SchemaItemFormValues,
  type SchemaStatus,
  type SchemaType,
} from "./schema";

const NONE = { value: "", label: "None" };

const typeItems = toOptions(schemaTypeValues, schemaTypeLabels);
const statusItems = toOptions(schemaStatusValues, schemaStatusLabels);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

/** Inline status selector used inside each checklist row. */
function StatusCell({
  id,
  status,
}: {
  id: number;
  status: SchemaStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      items={statusItems}
      value={status}
      onValueChange={(value) => {
        const next = (value as SchemaStatus) ?? status;
        if (next === status) return;
        startTransition(async () => {
          try {
            await updateSchemaStatus(id, next);
          } catch {
            toast.error("Could not update the status. Please try again.");
          }
        });
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label="Implementation status"
        className="w-40"
        disabled={isPending}
      >
        <SelectValue data-slot="select-value" />
      </SelectTrigger>
      <SelectContent>
        {statusItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            <Badge variant={schemaStatusBadgeVariant[item.value]}>
              {item.label}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DeleteButton({
  id,
  label,
}: {
  id: number;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteSchemaItem(id);
        toast.success("Schema item deleted.");
      } catch {
        toast.error("Could not delete this item. Please try again.");
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="sm" aria-label="Delete" />}
      >
        <TrashIcon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this schema item?</AlertDialogTitle>
          <AlertDialogDescription>
            The {label} entry will be permanently removed. This can&apos;t be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose
            render={<Button variant="outline" />}
            disabled={isPending}
          >
            Cancel
          </AlertDialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SchemaManager({
  items,
  assetOptions,
}: {
  items: SchemaItemWithAsset[];
  assetOptions: { id: number; name: string }[];
}) {
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const assetItems = [
    NONE,
    ...assetOptions.map((a) => ({ value: String(a.id), label: a.name })),
  ];

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<SchemaItemFormValues>({
    resolver: zodResolver(schemaItemFormSchema),
    defaultValues: emptySchemaItemForm,
  });

  function openCreate() {
    setMode("create");
    setEditingId(null);
    reset(emptySchemaItemForm);
  }

  function openEdit(item: SchemaItemWithAsset) {
    setMode("edit");
    setEditingId(item.id);
    reset({
      schemaType: item.schemaType as SchemaType,
      status: item.status as SchemaStatus,
      relatedAssetId: item.relatedAssetId ? String(item.relatedAssetId) : "",
      validationUrl: item.validationUrl ?? "",
      notes: item.notes ?? "",
    });
  }

  function closeForm() {
    setMode("closed");
    setEditingId(null);
  }

  function onSubmit(values: SchemaItemFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && editingId != null
          ? await updateSchemaItem(editingId, values)
          : await createSchemaItem(values);

      if (result.ok) {
        toast.success(
          mode === "edit" ? "Schema item updated." : "Schema item added.",
        );
        closeForm();
        return;
      }

      if (result.fieldErrors) {
        for (const [name, message] of Object.entries(result.fieldErrors)) {
          setError(name as keyof SchemaItemFormValues, { message });
        }
      }
      toast.error(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end">
        {mode === "closed" ? (
          <Button onClick={openCreate}>
            <PlusIcon />
            New schema item
          </Button>
        ) : null}
      </div>

      {mode !== "closed" ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "edit" ? "Edit schema item" : "New schema item"}
            </CardTitle>
            <CardDescription>
              Track a structured-data type and its implementation status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Schema type</Label>
                  <Controller
                    control={control}
                    name="schemaType"
                    render={({ field }) => (
                      <Select
                        items={typeItems}
                        value={field.value}
                        onValueChange={(value) => field.onChange(value ?? "")}
                      >
                        <SelectTrigger aria-label="Schema type">
                          <SelectValue data-slot="select-value" />
                        </SelectTrigger>
                        <SelectContent>
                          {typeItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={errors.schemaType?.message} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Implementation status</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        items={statusItems}
                        value={field.value}
                        onValueChange={(value) => field.onChange(value ?? "")}
                      >
                        <SelectTrigger aria-label="Implementation status">
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
                  <Label>Related asset</Label>
                  <Controller
                    control={control}
                    name="relatedAssetId"
                    render={({ field }) => (
                      <Select
                        items={assetItems}
                        value={field.value}
                        onValueChange={(value) => field.onChange(value ?? "")}
                      >
                        <SelectTrigger aria-label="Related asset">
                          <SelectValue data-slot="select-value" />
                        </SelectTrigger>
                        <SelectContent>
                          {assetItems.map((item) => (
                            <SelectItem
                              key={item.value || "none"}
                              value={item.value}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="validationUrl">Validation URL</Label>
                  <Input
                    id="validationUrl"
                    type="url"
                    placeholder="https://validator.schema.org/…"
                    aria-invalid={errors.validationUrl ? true : undefined}
                    {...register("validationUrl")}
                  />
                  <FieldError message={errors.validationUrl?.message} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Where it lives, what's left to do…"
                  {...register("notes")}
                />
                <FieldError message={errors.notes?.message} />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeForm}
                  disabled={isPending}
                >
                  <XIcon />
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? "Saving…"
                    : mode === "edit"
                      ? "Save changes"
                      : "Add schema item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {items.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <TablePropertiesIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">No schema items yet</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add the structured-data types you want to track.
              </p>
            </div>
            {mode === "closed" ? (
              <Button onClick={openCreate}>
                <PlusIcon />
                New schema item
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Schema type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Related asset</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {schemaTypeLabels[item.schemaType as SchemaType]}
                      {item.validationUrl ? (
                        <a
                          href={item.validationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          aria-label="Open validation URL"
                          title="Validation URL"
                        >
                          <ExternalLinkIcon className="size-3.5" />
                        </a>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusCell
                      id={item.id}
                      status={item.status as SchemaStatus}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.assetName ?? (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">
                    {item.notes ? (
                      <span className="line-clamp-2 whitespace-pre-wrap">
                        {item.notes}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Edit"
                        onClick={() => openEdit(item)}
                      >
                        <PencilIcon />
                      </Button>
                      <DeleteButton
                        id={item.id}
                        label={schemaTypeLabels[item.schemaType as SchemaType]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        {items.length} {items.length === 1 ? "schema type" : "schema types"}{" "}
        tracked
      </p>
    </div>
  );
}
