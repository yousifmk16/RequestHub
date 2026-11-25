import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The centred content column every page sits in. It lives in pages rather than
 * the root layout so a page can also render full-width bands (the dashboard hero).
 */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8", className)}>{children}</div>
  );
}
