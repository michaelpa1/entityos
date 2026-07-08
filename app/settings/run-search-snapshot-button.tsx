"use client";

import { useState, useTransition } from "react";
import { BarChart3Icon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { runSearchSnapshotNow } from "./actions";

type SnapshotResult = {
  query: string;
  position: number;
  ctrPercent: number;
  clicks: number;
  searchVolume: number;
};

function formatNumber(value: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat("en-AU", { maximumFractionDigits }).format(value);
}

export function RunSearchSnapshotButton() {
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<SnapshotResult | null>(null);

  function handleRun() {
    startTransition(async () => {
      const result = await runSearchSnapshotNow();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      const nextResult = {
        query: result.query,
        position: result.position,
        ctrPercent: result.ctrPercent,
        clicks: result.clicks,
        searchVolume: result.searchVolume,
      };

      setLastResult(nextResult);
      toast.success(
        `Search snapshot saved. Position ${formatNumber(result.position)}, CTR ${formatNumber(result.ctrPercent, 2)}%.`,
      );
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3Icon className="size-4 text-muted-foreground" />
          Google Search Console
        </CardTitle>
        <CardDescription>
          Save the top branded query from Google Search Console to the Search
          Snapshots table.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button type="button" onClick={handleRun} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2Icon className="animate-spin" />
              Running…
            </>
          ) : (
            <>
              <BarChart3Icon />
              Run Search Snapshot Now
            </>
          )}
        </Button>

        {lastResult ? (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Query:{" "}
              <span className="font-medium text-foreground">
                {lastResult.query}
              </span>
            </p>
            <p>
              Position:{" "}
              <span className="font-medium text-foreground">
                {formatNumber(lastResult.position)}
              </span>
              {" · "}
              CTR:{" "}
              <span className="font-medium text-foreground">
                {formatNumber(lastResult.ctrPercent, 2)}%
              </span>
              {" · "}
              Clicks:{" "}
              <span className="font-medium text-foreground">
                {formatNumber(lastResult.clicks, 0)}
              </span>
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
