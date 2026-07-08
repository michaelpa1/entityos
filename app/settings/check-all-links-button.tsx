"use client";

import { useState, useTransition } from "react";
import { Link2OffIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkAllLinksNow } from "./actions";

type LinkCheckResult = {
  checked: number;
  broken: number;
  summary: string;
};

export function CheckAllLinksButton() {
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<LinkCheckResult | null>(null);

  function handleRun() {
    startTransition(async () => {
      const result = await checkAllLinksNow();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setLastResult({
        checked: result.checked,
        broken: result.broken,
        summary: result.summary,
      });
      toast.success(result.summary);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2OffIcon className="size-4 text-muted-foreground" />
          Broken Link Checker
        </CardTitle>
        <CardDescription>
          Check every non-broken asset URL with a quick HEAD request and mark
          failures as broken.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button type="button" onClick={handleRun} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2Icon className="animate-spin" />
              Checking…
            </>
          ) : (
            <>
              <Link2OffIcon />
              Check All Links Now
            </>
          )}
        </Button>

        {lastResult ? (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Last run:{" "}
              <span className="font-medium text-foreground">
                {lastResult.summary}
              </span>
            </p>
            <p>
              Checked{" "}
              <span className="font-medium text-foreground">
                {lastResult.checked}
              </span>{" "}
              links and found{" "}
              <span className="font-medium text-foreground">
                {lastResult.broken}
              </span>{" "}
              broken.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
