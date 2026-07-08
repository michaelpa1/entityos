import Link from "next/link";
import { PencilIcon, ExternalLinkIcon, UserRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fieldGroups, type FieldConfig } from "./schema";
import { getIdentityProfile } from "./data";

export const dynamic = "force-dynamic";

function FieldRow({
  field,
  value,
}: {
  field: FieldConfig;
  value: string | null;
}) {
  const hasValue = value != null && value.trim() !== "";

  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:gap-4 sm:py-2.5">
      <dt className="w-full shrink-0 text-sm font-medium text-muted-foreground sm:w-56">
        {field.label}
      </dt>
      <dd className="w-full text-sm break-words">
        {!hasValue ? (
          <span className="text-muted-foreground/60 italic">Not set</span>
        ) : field.kind === "url" ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
          >
            <span className="break-all">{value}</span>
            <ExternalLinkIcon className="size-3.5 shrink-0" />
          </a>
        ) : (
          <span className="whitespace-pre-wrap text-foreground">{value}</span>
        )}
      </dd>
    </div>
  );
}

export default async function IdentityPage() {
  const identity = await getIdentityProfile();

  if (!identity) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Card className="items-center py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRoundIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium">No identity profile yet</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                You haven&apos;t created an identity profile. Add your canonical
                details to get started.
              </p>
            </div>
            <Button render={<Link href="/identity/edit" />}>
              Create profile
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const displayName = identity.preferredShortName || identity.canonicalName;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {displayName}
          </h1>
          {identity.primaryTitle ? (
            <p className="text-sm text-muted-foreground sm:text-base">
              {identity.primaryTitle}
            </p>
          ) : null}
        </div>
        <Button
          render={<Link href="/identity/edit" />}
          variant="outline"
          className="self-start sm:self-auto"
        >
          <PencilIcon />
          Edit
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {fieldGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl>
                {group.fields.map((field) => (
                  <FieldRow
                    key={field.name}
                    field={field}
                    value={identity[field.name] as string | null}
                  />
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
