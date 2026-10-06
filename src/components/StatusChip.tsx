import { cn } from "@/lib/utils";

export type ChipTone = "positive" | "primary" | "secondary" | "error" | "brand";

const toneClasses: Record<ChipTone, string> = {
  positive: "bg-positive/10 text-positive border-positive/30",
  primary: "bg-primary/10 text-primary border-primary/30",
  secondary: "bg-secondary/10 text-secondary border-secondary/30",
  error: "bg-destructive/10 text-destructive border-destructive/30",
  brand: "bg-brand-blue/10 text-brand-blue border-brand-blue/30",
};

interface StatusChipProps {
  tone: ChipTone;
  label: string;
  className?: string;
}

/**
 * Status chip per the design system: 4px radius, semantic tint, dot + word
 * (never color alone). Used for stock, damage, and status labels.
 */
const StatusChip = ({ tone, label, className }: StatusChipProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border px-1.5 py-0.5 text-[11px] font-semibold",
        toneClasses[tone],
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
};

export default StatusChip;