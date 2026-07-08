import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getIdentityProfile } from "../data";
import {
  SEED_CANONICAL_IDENTITY_SENTENCE,
  SEED_CANONICAL_NAME,
  type IdentityFormValues,
} from "../schema";
import { IdentityForm } from "./identity-form";

export const dynamic = "force-dynamic";

export default async function EditIdentityPage() {
  const identity = await getIdentityProfile();

  const defaultValues: IdentityFormValues = {
    canonicalName: identity?.canonicalName ?? SEED_CANONICAL_NAME,
    preferredShortName: identity?.preferredShortName ?? "",
    primaryTitle: identity?.primaryTitle ?? "",
    canonicalIdentitySentence:
      identity?.canonicalIdentitySentence ?? SEED_CANONICAL_IDENTITY_SENTENCE,
    shortBio25: identity?.shortBio25 ?? "",
    shortBio50: identity?.shortBio50 ?? "",
    bio100: identity?.bio100 ?? "",
    bio250: identity?.bio250 ?? "",
    mediaBio500: identity?.mediaBio500 ?? "",
    location: identity?.location ?? "",
    canonicalWebsiteUrl: identity?.canonicalWebsiteUrl ?? "",
    canonicalHeadshotUrl: identity?.canonicalHeadshotUrl ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/identity" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Identity
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit identity
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the canonical profile. Changes save to the database.
          </p>
        </div>
      </div>

      <IdentityForm defaultValues={defaultValues} />
    </main>
  );
}
