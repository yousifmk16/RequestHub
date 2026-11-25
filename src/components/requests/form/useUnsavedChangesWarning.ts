import { useEffect } from "react";

/**
 * Asks the browser to confirm before closing or reloading the tab while there
 * are unsaved changes. In-app links are handled separately (see RequestForm's
 * Cancel), since the App Router has no navigation-blocking API.
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);
}
