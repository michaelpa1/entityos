"use client";

import { useState, useTransition } from "react";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { runAiSnapshotsNow } from "./actions";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RunAiSnapshotsButton() {
  const [isPending, startTransition] = useTransition();
  const [lastRun, setLastRun] = useState<string | null>(null);

  function handleRun() {
    startTransition(async () => {
      const result = await runAiSnapshotsNow();
      if (result.ok) {
        setLastRun(result.timestamp);
        toast.success(
          `AI snapshots saved at ${formatTimestamp(result.timestamp)}`,
        );
        return;
      }
      toast.error(result.message);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-muted-foreground" />
          AI Snapshots
        </CardTitle>
        <CardDescription>
          Query ChatGPT and Gemini with the canonical prompt and save both
          responses to the AI Snapshots table.
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
              <SparklesIcon />
              Run AI Snapshot Now
            </>
          )}
        </Button>
        {lastRun ? (
          <p className="text-sm text-muted-foreground">
            Last run:{" "}
            <span className="font-medium text-foreground">
              {formatTimestamp(lastRun)}
            </span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
