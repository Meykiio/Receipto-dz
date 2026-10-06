import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  delta?: { text: string; tone?: "up" | "down" | "neutral" };
  money?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Dashboard stat card per the design system: uppercase label,
 * display-font value (emerald for money), optional semantic delta.
 */
const StatCard = ({ label, value, delta, money, className, children }: StatCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-transform duration-med ease-out hover:-translate-y-[3px] hover:border-outline-hi hover:shadow-sm",
        className
      )}
    >
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className={cn("font-display text-[26px] font-bold leading-tight text-foreground", money && "text-primary")}>
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "mt-1.5 text-xs font-semibold",
            delta.tone === "up" && "text-positive",
            delta.tone === "down" && "text-destructive",
            (!delta.tone || delta.tone === "neutral") && "text-muted-foreground"
          )}
        >
          {delta.text}
        </div>
      )}
      {children}
    </div>
  );
};

export default StatCard;