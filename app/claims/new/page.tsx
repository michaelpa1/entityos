import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClaimForm } from "../claim-form";
import { emptyClaimForm } from "../schema";

export default function NewClaimPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/claims" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon />
          Back to Claims
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            New claim
          </h1>
          <p className="text-sm text-muted-foreground">
            Record a statement about the entity.
          </p>
        </div>
      </div>

      <ClaimForm mode="create" defaultValues={emptyClaimForm} />
    </main>
  );
}
