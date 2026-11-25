"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

type DeleteRequestButtonProps = {
  requestId: string;
  requestTitle: string;
  /** "icon" in list rows; "button" (with text) on the edit page. */
  trigger?: "icon" | "button";
  /** Where to go after deleting, e.g. back to the list from the edit page. */
  redirectTo?: string;
};

/** Asks for confirmation, naming the request, before deleting it (R4). */
export function DeleteRequestButton({
  requestId,
  requestTitle,
  trigger = "icon",
  redirectTo,
}: DeleteRequestButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteRequest(event: React.MouseEvent) {
    // Keep the dialog open until the server answers, so a failure is visible.
    event.preventDefault();
    setIsDeleting(true);
    const result = await apiRequest(`/api/requests/${requestId}`, { method: "DELETE" });
    setIsDeleting(false);

    if (!result.ok && result.status !== 404) {
      toast.error("Request not deleted", { description: result.error });
      return;
    }
    setOpen(false);
    // A 404 means someone else already deleted it: the outcome the user wanted.
    toast.success("Request deleted", { description: requestTitle });
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isDeleting && setOpen(next)}>
      <AlertDialogTrigger asChild>
        {trigger === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${requestTitle}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 />
          </Button>
        ) : (
          // Solid red with white text: 5.5:1, where the tinted variant failed 4.5:1.
          <Button size="lg" className="h-10 bg-brand-red-strong px-4 text-white hover:bg-brand-red-strong/90">
            <Trash2 /> Delete request
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this request?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;<span className="font-medium text-foreground [overflow-wrap:anywhere]">{requestTitle}</span>
            &rdquo; will be removed for everyone. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Keep request</AlertDialogCancel>
          {/* A plain Button, not AlertDialogAction: that wraps Radix's Slot, which
              concatenates classes instead of merging them, so the variant's
              bg-primary competed with the red (light in dark mode: failed
              contrast). Closing is handled by `open` state anyway. */}
          <Button
            onClick={deleteRequest}
            className="bg-brand-red-strong text-white hover:bg-brand-red-strong/90"
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete request"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
