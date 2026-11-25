import { useEffect } from "react";

const DISCARD_MESSAGE = "Discard your changes?";

/**
 * Warns before unsaved changes are lost:
 * - closing or reloading the tab: the browser's own beforeunload prompt;
 * - clicking any in-app link (header, logo, back link, Cancel): a confirm.
 *
 * The App Router has no navigation-blocking API, so links are caught by a
 * document listener in the capture phase. It runs before Next's <Link>
 * handler, so stopping the event there cancels the navigation.
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const warnOnUnload = (event: BeforeUnloadEvent) => event.preventDefault();

    const confirmOnLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // new tab/window
      const link = (event.target as Element | null)?.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;

      const destination = new URL(link.href);
      const here = window.location;
      if (destination.origin !== here.origin) return; // external: beforeunload covers it
      if (destination.pathname === here.pathname && destination.search === here.search) return;

      if (!window.confirm(DISCARD_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", warnOnUnload);
    document.addEventListener("click", confirmOnLinkClick, true);
    return () => {
      window.removeEventListener("beforeunload", warnOnUnload);
      document.removeEventListener("click", confirmOnLinkClick, true);
    };
  }, [hasUnsavedChanges]);
}
