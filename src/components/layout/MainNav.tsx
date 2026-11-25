"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActivePath, NAV_LINKS } from "./nav-links";

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={cn("flex items-stretch gap-1 self-stretch", className)}>
      {NAV_LINKS.map(({ href, label }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              // The underline sits on the header's bottom edge, like a tab.
              "relative flex items-center px-3 text-sm font-medium text-primary-foreground/75 transition-colors hover:text-primary-foreground",
              "focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-primary-foreground",
              active &&
                "text-primary-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
