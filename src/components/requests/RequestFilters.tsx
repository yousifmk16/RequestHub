"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  SEARCH_MAX_LENGTH,
  SORT_LABELS,
  SORT_OPTIONS,
  STATUS_LABELS,
  STATUSES,
  type SortOption,
} from "@/lib/constants";
import { buildRequestsHref, hasActiveFilters } from "@/lib/request-query-url";
import type { RequestQuery } from "@/lib/validation";

const SEARCH_DELAY_MS = 300;
const ALL = "all"; // Radix Select can't use "" as an item value

/**
 * Search, filter and sort controls (R6). The URL is the source of truth, so
 * every view is shareable and survives a refresh. Selects update instantly
 * (optimistic) while the server re-renders the list.
 */
export function RequestFilters({ query }: { query: RequestQuery }) {
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

  function setFilter(key: "category" | "status" | "priority", value: string) {
    navigate({ ...current, [key]: value === ALL ? undefined : value });
  }

  function clearFilters() {
    clearTimeout(searchTimer.current);
    setSearch("");
    setPushedSearch(undefined);
    navigate({ sort: current.sort });
  }

  return (
    <div data-pending={isPending || undefined} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1fr)_repeat(4,10rem)]">
        <form
          role="search"
          className="relative col-span-2 lg:col-span-1"
          onSubmit={(event) => {
            event.preventDefault();
            pushSearch(search);
          }}
        >
          <label htmlFor="request-search" className="sr-only">
            Search requests
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="request-search"
            type="search"
            value={search}
            maxLength={SEARCH_MAX_LENGTH}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && search && onSearchChange("")}
            placeholder="Search title or description"
            className="h-10 bg-card ps-9 pe-9 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute top-1/2 end-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        <FilterSelect
          label="Department"
          allLabel="All departments"
          value={current.category}
          options={CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] }))}
          onChange={(value) => setFilter("category", value)}
        />
        <FilterSelect
          label="Status"
          allLabel="All statuses"
          value={current.status}
          options={STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }))}
          onChange={(value) => setFilter("status", value)}
        />
        <FilterSelect
          label="Priority"
          allLabel="All priorities"
          value={current.priority}
          options={PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }))}
          onChange={(value) => setFilter("priority", value)}
        />
        <div>
          <label htmlFor="request-sort" className="sr-only">
            Sort
          </label>
          <Select value={current.sort} onValueChange={(value) => navigate({ ...current, sort: value as SortOption })}>
            <SelectTrigger id="request-sort" className="h-10 w-full bg-card">
              {/* Explicit label so server HTML isn't blank before hydration. */}
              <SelectValue>{SORT_LABELS[current.sort]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((value) => (
                <SelectItem key={value} value={value}>
                  {SORT_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters(current) && (
        <div>
          <Button variant="link" size="sm" onClick={clearFilters} className="h-auto px-0 text-brand-red-strong">
            <X /> Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  allLabel: string;
  value: string | undefined;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

function FilterSelect({ label, allLabel, value, options, onChange }: FilterSelectProps) {
  const id = `filter-${label.toLowerCase()}`;
  const selectedLabel = options.find((option) => option.value === value)?.label ?? allLabel;
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Select value={value ?? ALL} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-10 w-full bg-card data-[active=true]:border-brand-slate" data-active={Boolean(value)}>
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
