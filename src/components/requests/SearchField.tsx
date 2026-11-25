"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SEARCH_MAX_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Enter applies the search immediately instead of waiting for the pause. */
  onSubmit: () => void;
  className?: string;
};

export function SearchField({ value, onChange, onSubmit, className }: SearchFieldProps) {
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="request-search" className="sr-only">
        Search requests
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id="request-search"
        type="search"
        value={value}
        maxLength={SEARCH_MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === "Escape" && value && onChange("")}
        placeholder="Search title or description"
        className="h-10 bg-card ps-9 pe-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 end-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
