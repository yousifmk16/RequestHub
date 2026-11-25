import { cn } from "@/lib/utils";

type CharacterCountProps = {
  id: string;
  length: number;
  limits: { min: number; max: number };
};

/** "42 / 100". Turns red past the limit, so people see why before they submit. */
export function CharacterCount({ id, length, limits }: CharacterCountProps) {
  const over = length > limits.max;
  return (
    <p
      id={id}
      className={cn("text-xs tabular-nums", over ? "font-bold text-destructive" : "text-muted-foreground")}
    >
      {length} / {limits.max}
      <span className="sr-only"> characters, at least {limits.min}</span>
    </p>
  );
}
