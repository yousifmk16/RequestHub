"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { DESCRIPTION_LENGTH, TITLE_LENGTH } from "@/lib/constants";
import { requestFormSchema, type RequestFormValues } from "@/lib/validation";
import { CharacterCount } from "./CharacterCount";
import { FieldError } from "./FieldError";
import { OptionCards } from "./OptionCards";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS } from "./options";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";

type RequestFormProps =
  | { mode: "create" }
  | { mode: "edit"; requestId: string; initialValues: Required<RequestFormValues> };

const FIELDS = ["title", "description", "category", "priority", "status"] as const;
const isFormField = (key: string): key is (typeof FIELDS)[number] => (FIELDS as readonly string[]).includes(key);

/**
 * Create (R1) and edit (R3) form. Validates with the same Zod schema as the
 * API: errors show under each field as soon as it's left, and any errors the
 * server still finds are mapped back onto the same fields.
 */
export function RequestForm(props: RequestFormProps) {
  const isEdit = props.mode === "edit";
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: isEdit ? props.initialValues : { title: "", description: "" },
    mode: "onTouched",
  });
  const [title = "", description = ""] = useWatch({ control, name: ["title", "description"] });
  useUnsavedChangesWarning(isDirty && !saved);

  async function onSubmit(values: RequestFormValues) {
    const result = isEdit
      ? await apiRequest(`/api/requests/${props.requestId}`, { method: "PATCH", body: JSON.stringify(values) })
      : await apiRequest("/api/requests", { method: "POST", body: JSON.stringify(values) });

    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (isFormField(field) && messages?.[0]) setError(field, { type: "server", message: messages[0] });
      }
      toast.error(isEdit ? "Changes not saved" : "Request not created", { description: result.error });
      return;
    }

    setSaved(true); // the "unsaved changes" prompt no longer applies
    toast.success(isEdit ? "Changes saved" : "Request created", { description: values.title });
    router.push("/requests");
    router.refresh(); // also refresh the layout, so the header's workload logo updates
  }

  function confirmDiscard(event: React.MouseEvent) {
    if (isDirty && !window.confirm("Discard your changes?")) event.preventDefault();
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-7 rounded-xl border bg-card p-5 sm:p-7">
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="title" className="text-sm font-bold">Title</label>
          <CharacterCount id="title-count" length={title.length} limits={TITLE_LENGTH} />
        </div>
        <Input
          id="title"
          autoComplete="off"
          placeholder="Laptop won't turn on"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error title-count" : "title-count"}
          className="mt-2 h-11 text-base md:text-base"
          {...register("title")}
        />
        <FieldError id="title-error" message={errors.title?.message} />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="description" className="text-sm font-bold">Description</label>
          <CharacterCount id="description-count" length={description.length} limits={DESCRIPTION_LENGTH} />
        </div>
        <Textarea
          id="description"
          placeholder="What happened, since when, and anything you've already tried."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error description-count" : "description-count"}
          // The textarea grows with its content (field-sizing); this sets a roomy start.
          className="mt-2 min-h-36 text-base md:text-base"
          {...register("description")}
        />
        <FieldError id="description-error" message={errors.description?.message} />
      </div>

      <OptionCards
        legend="Department"
        options={CATEGORY_OPTIONS}
        registration={register("category")}
        error={errors.category?.message}
        className="sm:grid-cols-2"
      />
      <OptionCards
        legend="Priority"
        options={PRIORITY_OPTIONS}
        registration={register("priority")}
        error={errors.priority?.message}
        className="sm:grid-cols-3"
      />
      {isEdit && (
        <OptionCards
          legend="Status"
          options={STATUS_OPTIONS}
          registration={register("status")}
          error={errors.status?.message}
          className="sm:grid-cols-3"
        />
      )}

      <div className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-end">
        <Button asChild variant="outline" size="lg" className="h-10 px-5">
          <Link href="/requests" onClick={confirmDiscard}>Cancel</Link>
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting} className="h-10 px-5">
          {isSubmitting && <LoaderCircle className="animate-spin" />}
          {isSubmitting ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create request"}
        </Button>
      </div>
    </form>
  );
}
