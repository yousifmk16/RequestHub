import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "./MainNav";
import { MobileNav } from "./MobileNav";
import { RoutingMark } from "./RoutingMark";

export function SiteHeader() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-[15px] font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
        >
          <span className="grid size-7 place-items-center rounded-md bg-primary-foreground">
            <RoutingMark className="size-4" />
          </span>
          Request Hub
        </Link>

        <MainNav className="hidden md:flex" />

        <div className="ms-auto flex items-center gap-1">
          <Button
            asChild
            size="lg"
            className="bg-primary-foreground px-3 text-primary hover:bg-primary-foreground/90 focus-visible:ring-primary-foreground/60"
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
