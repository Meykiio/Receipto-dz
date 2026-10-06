import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import BudgetBar from "@/components/BudgetBar";

interface InsightsSummary {
  totalSpent: number;
  averagePerReceipt: number;
  totalReceipts: number;
}

interface MonthlySummaryPanelProps {
  summary: InsightsSummary;
  monthlyBudget: number;
  dailyAvg: number;
  dailyBudget: number;
  overBudget: boolean;
  budgetUsed: number;
  currency?: string;
  loading: boolean;
}

/**
 * Monthly spending summary panel (design doc: this-month figures + budget bars).
 */
export const MonthlySummaryPanel = ({
  summary, monthlyBudget, dailyAvg, dailyBudget, overBudget, budgetUsed, currency, loading,
}: MonthlySummaryPanelProps) => {
  const { t } = useTranslation();
  const money = (v: number) => formatCurrency(v, currency);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">{t("insights.loadingChartData")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-center p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">{t("insights.thisMonth")}</span>
          <span className="text-xl font-semibold text-foreground">{money(summary.totalSpent)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-muted-foreground">{t("insights.receiptsShort")}</span>
          <span className="text-xl font-semibold text-foreground">{summary.totalReceipts}</span>
        </div>
      </div>

      <div className="mt-2 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">{t("insights.avgPerReceipt")}</span>
            <span className="text-foreground">{money(summary.averagePerReceipt)}</span>
          </div>
          <BudgetBar spent={summary.averagePerReceipt} budget={monthlyBudget || 1} />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">{t("insights.dailyAverageShort")}</span>
            <span className={overBudget ? "text-destructive" : "text-positive"}>{money(dailyAvg)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-[width] duration-slow ease-out ${overBudget ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${Math.min(100, (dailyAvg / (dailyBudget || 1)) * 100)}%` }}
            />
          </div>
        </div>
        <div className="mt-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t("insights.monthlyBudget")}</span>
            <span className="text-sm font-medium text-foreground">{budgetUsed}% {t("insights.used")}</span>
          </div>
          <div className="mt-1 text-right text-sm text-muted-foreground">
            {money(summary.totalSpent)} {t("insights.spentOf")} {money(monthlyBudget)}
          </div>
        </div>
      </div>
    </div>
  );
};