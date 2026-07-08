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
import {
  evidenceStatusLabels,
  evidenceStatusValues,
  evidenceStrengthLabels,
  evidenceStrengthValues,
  sourceTypeLabels,
  sourceTypeValues,
  toOptions,
} from "./schema";

const ALL = "all";

type FilterKey = "source" | "strength" | "status";

const filterConfig: {
  key: FilterKey;
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "source",
    label: "Source type",
    allLabel: "All sources",
    options: toOptions(sourceTypeValues, sourceTypeLabels),
  },
  {
    key: "strength",
    label: "Strength",
    allLabel: "All strengths",
    options: toOptions(evidenceStrengthValues, evidenceStrengthLabels),
  },
  {
    key: "status",
    label: "Status",
    allLabel: "All statuses",
    options: toOptions(evidenceStatusValues, evidenceStatusLabels),
  },
];

export function EvidenceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = useCallback(
    (key: FilterKey, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === ALL) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams],
  );

  const hasFilters = filterConfig.some((f) => searchParams.has(f.key));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {filterConfig.map((filter) => {
        const current = searchParams.get(filter.key) ?? ALL;
        const items = [{ value: ALL, label: filter.allLabel }, ...filter.options];
        return (
          <div key={filter.key} className="flex flex-col gap-1.5 sm:w-52">
            <span className="text-xs font-medium text-muted-foreground">
              {filter.label}
            </span>
            <Select
              items={items}
              value={current}
              onValueChange={(value) =>
                setFilter(filter.key, (value as string) ?? ALL)
              }
            >
              <SelectTrigger aria-label={filter.label}>
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
        );
      })}

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
