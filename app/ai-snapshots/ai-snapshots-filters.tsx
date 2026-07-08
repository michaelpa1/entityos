"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiProviderLabels, aiProviderValues, toOptions } from "./schema";

const ALL = "all";

export function AiSnapshotsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === ALL) {
        params.delete("provider");
      } else {
        params.set("provider", value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams],
  );

  const items = [
    { value: ALL, label: "All providers" },
    ...toOptions(aiProviderValues, aiProviderLabels),
  ];
  const current = searchParams.get("provider") ?? ALL;
  const hasFilters = searchParams.has("provider");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5 sm:w-52">
        <span className="text-xs font-medium text-muted-foreground">
          Provider
        </span>
        <Select
          items={items}
          value={current}
          onValueChange={(value) => setFilter((value as string) ?? ALL)}
        >
          <SelectTrigger aria-label="Provider">
            <SelectValue data-slot="select-value" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="text-muted-foreground sm:mb-0.5"
        >
          <XIcon />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
