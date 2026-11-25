"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Status } from "@/generated/prisma/enums";
import { apiRequest } from "@/lib/api-client";
import { STATUS_LABELS, STATUSES } from "@/lib/constants";
import { StatusBadge } from "./StatusBadge";

type StatusSelectProps = {
  requestId: string;
  requestTitle: string;
  status: Status;
};

/**
 * Changes a request's status straight from the list (R5). The new value shows
 * immediately; if the save fails it rolls back and explains why.
 */
export function StatusSelect({ requestId, requestTitle, status }: StatusSelectProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(status);
  const [isSaving, setIsSaving] = useState(false);

  // When the server's value changes (after a refresh), it becomes the truth.
  const [lastServerStatus, setLastServerStatus] = useState(status);
  if (status !== lastServerStatus) {
    setLastServerStatus(status);
    setSelected(status);
  }

  async function changeStatus(next: Status) {
    if (next === selected) return;
    const previous = selected;
    setSelected(next);
    setIsSaving(true);

    const result = await apiRequest(`/api/requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next }),
    });
    setIsSaving(false);

    if (!result.ok) {
      setSelected(previous);
      toast.error("Status not changed", { description: result.error });
      return;
    }
    toast.success(`Status changed to ${STATUS_LABELS[next]}`, { description: requestTitle });
    router.refresh(); // updates counts elsewhere, including the header logo
  }

  return (
    <Select value={selected} onValueChange={(value) => changeStatus(value as Status)} disabled={isSaving}>
      <SelectTrigger
        aria-label={`Status of ${requestTitle}`}
        aria-busy={isSaving}
        className="h-8 w-fit gap-1 rounded-full border-transparent px-1 hover:border-input data-[state=open]:border-input"
      >
        {/* Explicit content so the pill is in the server HTML, not blank until hydration. */}
        <SelectValue>
          <StatusBadge status={selected} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        {STATUSES.map((value) => (
          <SelectItem key={value} value={value}>
            <StatusBadge status={value} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
