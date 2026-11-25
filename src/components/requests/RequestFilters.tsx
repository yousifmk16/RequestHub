"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { Status } from "@/generated/prisma/enums";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  SORT_LABELS,
  SORT_OPTIONS,
} from "@/lib/constants";
import { buildRequestsHref, hasActiveFilters } from "@/lib/request-query-url";
import type { RequestQuery } from "@/lib/validation";
import { ExportCsvButton } from "./ExportCsvButton";
import { FilterSelect } from "./FilterSelect";
import { SearchField } from "./SearchField";
import { StatusChips } from "./StatusChips";

const SEARCH_DELAY_MS = 300;

type RequestFiltersProps = {
  query: RequestQuery;
  statusCounts: Record<Status, number>;
  resultCount: number;
};

/**
 * Search, filter and sort controls (R6). The URL is the source of truth, so
 * every view is shareable and survives a refresh. Controls update instantly
 * (optimistic) while the server re-renders the list.
 */
export function RequestFilters({ query, statusCounts, resultCount }: RequestFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useOptimistic(query);

  // Search is typed locally and pushed to the URL after a pause.
  const [search, setSearch] = useState(query.q ?? "");
  const [pushedSearch, setPushedSearch] = useState(query.q);
  const [lastUrlSearch, setLastUrlSearch] = useState(query.q);
  if (query.q !== lastUrlSearch) {
    setLastUrlSearch(query.q);
    // Adopt URL changes made elsewhere (Clear filters link, back button), but
    // not the echo of our own debounced push, which may lag behind typing.
    if (query.q !== pushedSearch) {
      setSearch(query.q ?? "");
      setPushedSearch(query.q);
    }
  }

  const latest = useRef(current);
  useEffect(() => {
    latest.current = current;
  }, [current]);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(searchTimer.current), []);

  function navigate(next: RequestQuery) {
    startTransition(() => {
      setCurrent(next);
      router.replace(buildRequestsHref(next), { scroll: false });
    });
  }

  function pushSearch(value: string) {
    clearTimeout(searchTimer.current);
    const q = value.trim() || undefined;
    if (q === latest.current.q) return;
    setPushedSearch(q);
    navigate({ ...latest.current, q });
  }

  function onSearchChange(value: string) {
    setSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => pushSearch(value), SEARCH_DELAY_MS);
  }

  function clearFilters() {
    clearTimeout(searchTimer.current);
    setSearch("");
    setPushedSearch(undefined);
    navigate({ sort: current.sort });
  }

  const filtered = hasActiveFilters(current);
  const noun = resultCount === 1 ? "request" : "requests";

  return (
    <div data-pending={isPending || undefined} className="flex flex-col gap-3">
      <StatusChips value={current.status} counts={statusCounts} onChange={(status) => navigate({ ...current, status })} />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1fr)_repeat(2,11rem)]">
        <SearchField
          value={search}
          onChange={onSearchChange}
          onSubmit={() => pushSearch(search)}
          className="col-span-2 lg:col-span-1"
        />
        <FilterSelect
          id="filter-department"
          label="Department"
          allLabel="All departments"
          value={current.category}
          options={CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] }))}
          onChange={(category) => navigate({ ...current, category: category as RequestQuery["category"] })}
        />
        <FilterSelect
          id="filter-priority"
          label="Priority"
          allLabel="All priorities"
          value={current.priority}
          options={PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }))}
          onChange={(priority) => navigate({ ...current, priority: priority as RequestQuery["priority"] })}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-3 text-sm">
          <p className="text-muted-foreground tabular-nums" aria-live="polite">
            {filtered ? `${resultCount} matching ${noun}` : `${resultCount} ${noun}`}
          </p>
          {filtered && (
            <Button variant="link" size="sm" onClick={clearFilters} className="h-auto px-0 text-accent-text">
              <X /> Clear filters
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Built from the optimistic query, so it matches the controls even mid-load. */}
          {resultCount > 0 && <ExportCsvButton query={current} />}
          <FilterSelect
            id="request-sort"
            label="Sort"
            allLabel={SORT_LABELS.newest}
            value={current.sort === "newest" ? undefined : current.sort}
            options={SORT_OPTIONS.filter((sort) => sort !== "newest").map((value) => ({ value, label: SORT_LABELS[value] }))}
            onChange={(sort) => navigate({ ...current, sort: (sort ?? "newest") as RequestQuery["sort"] })}
            className="w-44"
          />
        </div>
      </div>
    </div>
  );
}
