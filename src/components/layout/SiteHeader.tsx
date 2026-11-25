import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "./MainNav";
import { MobileNav } from "./MobileNav";
import { RoutingMark } from "./RoutingMark";

// White header with navy type and the red action, as on lakeora.ai.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-base font-extrabold text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <RoutingMark />
          Request Hub
        </Link>

        <MainNav className="hidden md:flex" />

        <div className="ms-auto flex items-center gap-1">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-brand-red-strong px-3.5 text-white hover:bg-brand-red-strong/90 sm:px-4"
          >
            <Link href="/requests/new">
              <PlusIcon />
              <span className="sr-only sm:not-sr-only">New request</span>
            </Link>
          </Button>
          <MobileNav className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
