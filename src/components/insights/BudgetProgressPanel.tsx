import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Wallet, TrendingUp, Clock } from "lucide-react";
import { SpendingGoalChart } from "@/components/InsightCharts";

interface GoalData { name: string; value: number; }

interface BudgetProgressPanelProps {
  goalData: GoalData[];
  totalSpent: number;
  monthlyBudget: number;
  dailyAvg: number;
  dailyBudget: number;
  overBudget: boolean;
  remaining: number;
  daysLeft: number;
  currency?: string;
  loading: boolean;
}

/**
 * Budget progress panel with the design doc goal gauge + metric grid.
 */
export const BudgetProgressPanel = ({
  goalData, totalSpent, monthlyBudget, dailyAvg, dailyBudget, overBudget, remaining, daysLeft, currency, loading,
}: BudgetProgressPanelProps) => {
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
    <div className="flex h-full flex-col items-center justify-center p-4">
      <SpendingGoalChart data={goalData} />
      <div className="mt-4 mb-6 w-full text-center">
        <div className="mb-5 flex items-center justify-center gap-2 border-b border-border pb-3">
          <span className="text-lg font-semibold text-foreground">{money(totalSpent)}</span>
          <span className="text-sm text-muted-foreground">{t("insights.spentOf")}</span>
          <span className="text-lg font-semibold text-foreground">{money(monthlyBudget)}</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Wallet className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("insights.remaining")}</span>
            </div>
            <p className={`font-medium ${remaining > 0 ? "text-positive" : "text-destructive"}`}>
              {money(remaining)}
              {remaining <= 0 && <span className="ml-1 text-xs">({t("insights.over")})</span>}
            </p>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("insights.dailyBudget")}</span>
            </div>
            <p className="font-medium text-foreground">{money(dailyBudget)}</p>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("insights.avgPerDay")}</span>
            </div>
            <p className={`font-medium ${overBudget ? "text-destructive" : "text-positive"}`}>
              {money(dailyAvg)}
              {overBudget && <span className="ml-1 text-xs">↑</span>}
            </p>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("insights.daysLeft")}</span>
            </div>
            <p className="font-medium text-foreground">{daysLeft}</p>
          </div>
        </div>
      </div>
    </div>
  );
};