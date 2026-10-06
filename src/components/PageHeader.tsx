import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  label?: string;
  children?: React.ReactNode;
}

/**
 * Shared page header matching the Receipto design system section-header
 * pattern: optional small uppercase label, single h1 page title in the
 * display font, muted description, and actions on the right.
 */
const PageHeader = ({ title, description, label, children }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        {label && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-secondary">
              {label}
            </span>
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-[580px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;