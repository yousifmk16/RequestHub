export const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/requests", label: "Requests" },
] as const;

/** "/requests" stays active on its sub-pages (new, edit); "/" only on itself. */
export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
