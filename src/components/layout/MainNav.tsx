"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { isActivePath, NAV_LINKS } from "./nav-links";

/**
 * The pathname is request-time data on dynamic routes (e.g. /requests/[id]/edit),
 * so reading it must sit inside Suspense. The fallback is the same links without
 * the active underline, so the prerendered header is fully usable.
 */
export function MainNav({ className }: { className?: string }) {
  return (
    <Suspense fallback={<NavLinks activePath={null} className={className} />}>
      <ActiveNavLinks className={className} />
    </Suspense>
  );
}

function ActiveNavLinks({ className }: { className?: string }) {
  return <NavLinks activePath={usePathname()} className={className} />;
}

function NavLinks({ activePath, className }: { activePath: string | null; className?: string }) {
  return (
    <nav aria-label="Main" className={cn("flex items-stretch gap-1 self-stretch", className)}>
      {NAV_LINKS.map(({ href, label }) => {
        const active = activePath !== null && isActivePath(activePath, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              // The underline sits on the header's bottom edge, like a tab.
              "relative flex items-center px-3 text-sm font-medium text-white/75 transition-colors hover:text-white",
              "focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-8px] focus-visible:outline-white",
              active &&
                "text-white after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-brand-red",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
