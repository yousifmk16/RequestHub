import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  /** Page-level actions, e.g. a primary button. Sits right of the title on wide screens. */
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-[1.95rem] sm:leading-tight">{title}</h1>
        {description && <p className="max-w-prose text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
