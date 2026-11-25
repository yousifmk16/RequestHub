"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ALL = "all"; // Radix Select can't use "" as an item value

type FilterSelectProps = {
  id: string;
  label: string;
  allLabel: string;
  value: string | undefined;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string | undefined) => void;
  className?: string;
};

/** A labelled select with an "All …" option that means "no filter". */
export function FilterSelect({ id, label, allLabel, value, options, onChange, className }: FilterSelectProps) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? allLabel;

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Select value={value ?? ALL} onValueChange={(next) => onChange(next === ALL ? undefined : next)}>
        <SelectTrigger
          id={id}
          data-active={Boolean(value)}
          className="h-10 w-full bg-card data-[active=true]:border-brand-slate"
        >
          {/* Explicit label so the server HTML isn't blank before hydration. */}
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
