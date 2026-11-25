import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { FieldError } from "./FieldError";

export type OptionCard = {
  value: string;
  label: string;
  hint?: string;
  /** Visual cue shown before the label, e.g. a routing tab or signal bars. */
  adornment?: ReactNode;
};

type OptionCardsProps = {
  legend: string;
  options: OptionCard[];
  registration: UseFormRegisterReturn;
  error?: string;
  className?: string;
};

/**
 * A radio group drawn as cards. Native radio inputs stay in the DOM (visually
 * hidden), so arrow keys, focus, form reset and screen readers all work as
 * they do for any radio group.
 */
export function OptionCards({ legend, options, registration, error, className }: OptionCardsProps) {
  const errorId = `${registration.name}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-bold">{legend}</legend>
      <div className={cn("mt-2 grid gap-2", className)}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "group relative flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 pe-9 transition-colors",
              "hover:border-brand-slate/50 has-checked:border-brand-navy has-checked:bg-secondary has-checked:ring-1 has-checked:ring-brand-navy",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
              error && "border-destructive/60",
            )}
          >
            <input type="radio" value={option.value} className="sr-only" {...registration} />
            {option.adornment}
            <span className="min-w-0">
              <span className="block text-sm font-bold">{option.label}</span>
              {option.hint && <span className="mt-0.5 block text-xs text-muted-foreground">{option.hint}</span>}
            </span>
            <CircleCheck
              aria-hidden="true"
              className="absolute top-3 end-3 size-4 text-brand-navy opacity-0 transition-opacity group-has-checked:opacity-100"
            />
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
