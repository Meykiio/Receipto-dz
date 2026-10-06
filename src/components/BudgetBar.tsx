import { cn } from "@/lib/utils";

interface BudgetBarProps {
  spent: number;
  budget: number;
}

/**
 * Stateful budget progress bar per the design system:
 * emerald under 70%, saffron 70-100%, red over 100%.
 * Animated fill using the signature ease-out curve.
 */
const BudgetBar = ({ spent, budget }: BudgetBarProps) => {
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const tone = pct > 100 ? "over" : pct >= 70 ? "warn" : "ok";

  return (
    <div className="mt-2">
      <div className={cn("h-2 overflow-hidden rounded-full bg-muted", tone !== "ok" && tone)}>
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-slow ease-out",
            tone === "over" && "bg-destructive",
            tone === "warn" && "bg-secondary",
            tone === "ok" && "bg-primary"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default BudgetBar;