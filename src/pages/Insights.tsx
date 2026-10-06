import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Download, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { format } from "date-fns";
import InsightsReport from "@/components/InsightsReport";
import { ChartCard, VendorSpendingChart } from "@/components/InsightCharts";
import { getInsightsData } from "@/services/insightsService";
import { useBudget } from "@/hooks/queries";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { MonthlySummaryPanel } from "@/components/insights/MonthlySummaryPanel";
import { BudgetProgressPanel } from "@/components/insights/BudgetProgressPanel";

interface SpendingData { date: string; value: number; }
interface SpendingByVendorData { name: string; value: number; }
interface GoalData { name: string; value: number; }

/** Chart-only placeholder row; never real data, never shown in exports. */
const NO_DATA = "No Data";

interface InsightsSummary {
  totalSpent: number;
  averagePerReceipt: number;
  topCategory: string | null;
  topVendor: string | null;
  totalReceipts: number;
  daysLeft: number;
}

const Insights = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userSettings } = useUserSettings();
  const [dateRange, setDateRange] = useState("30");
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [vendorData, setVendorData] = useState<SpendingByVendorData[]>([]);
  const [goalData, setGoalData] = useState<GoalData[]>([{ name: "Budget", value: 0 }]);
  const [summary, setSummary] = useState<InsightsSummary>({
    totalSpent: 0, averagePerReceipt: 0, topCategory: null, topVendor: null, totalReceipts: 0, daysLeft: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { data: budget } = useBudget(new Date().toISOString().slice(0, 7) + "-01");
  const monthlyBudget = budget?.amount ?? 0;

  const fetchInsightsData = async (days: number) => {
    if (!user) return;
    setLoading(true);
    try {
      let period = "month";
      if (days <= 7) period = "week";
      else if (days <= 31) period = "month";
      else if (days <= 90) period = "quarter";
      else period = "year";

      const insights = await getInsightsData(period);
      const spendingTrends = insights.spendingTrends.map(item => ({ date: item.date, value: item.amount }));
      const vendorSpending = insights.spendingByVendor.map(item => ({ name: item.vendor, value: item.amount }));
      if (vendorSpending.length === 0) vendorSpending.push({ name: NO_DATA, value: 0 });

      const budgetPercentage = monthlyBudget > 0 ? Math.round((insights.totalSpent / monthlyBudget) * 100) : 0;
      setSpendingData(spendingTrends);
      setVendorData(vendorSpending);
      setGoalData([{ name: "Budget", value: budgetPercentage }]);

      const topCategory = insights.spendingByCategory.length > 0 ? insights.spendingByCategory[0].category : null;
      setSummary({
        totalSpent: insights.totalSpent,
        averagePerReceipt: insights.averageSpending,
        topCategory,
        topVendor: vendorSpending.length > 0 && vendorSpending[0].name !== NO_DATA ? vendorSpending[0].name : null,
        totalReceipts: insights.receiptCount,
        daysLeft: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate(),
      });
    } catch (error) {
      console.error("Error fetching insights data:", error);
      setSpendingData([{ date: format(new Date(), "yyyy-MM-dd"), value: 0 }]);
      setVendorData([{ name: NO_DATA, value: 0 }]);
      setGoalData([{ name: "Budget", value: 0 }]);
      setSummary({ totalSpent: 0, averagePerReceipt: 0, topCategory: null, topVendor: null, totalReceipts: 0, daysLeft: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    fetchInsightsData(parseInt(value));
  };

  useEffect(() => {
    if (user && userSettings) fetchInsightsData(parseInt(dateRange));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateRange, userSettings]);

  const days = parseInt(dateRange) || 30;
  const dailyAvg = summary.totalSpent / days;
  const dailyBudget = monthlyBudget / 30;
  const overBudget = monthlyBudget > 0 && dailyAvg > dailyBudget;
  const budgetUsed = monthlyBudget > 0 ? Math.round((summary.totalSpent / monthlyBudget) * 100) : 0;
  const remaining = Math.max(0, monthlyBudget - summary.totalSpent);
  const currency = userSettings?.currency;

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <PageHeader title={t("insights.title")} description={t("insights.subtitle")}>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label={t("insights.dateRangeLabel")}>
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("insights.last30")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t("insights.last7")}</SelectItem>
                <SelectItem value="30">{t("insights.last30")}</SelectItem>
                <SelectItem value="90">{t("insights.last90")}</SelectItem>
                <SelectItem value="365">{t("insights.lastYear")}</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full gap-2 sm:w-auto" onClick={() => setIsReportOpen(true)}>
              <Download className="h-4 w-4" /> {t("insights.generateReport")}
            </Button>
          </div>
        </PageHeader>

        {/* Summary cards — design doc stat-card pattern */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("insights.totalSpent")} value={loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(summary.totalSpent, currency)} money>
            {!loading && <p className="mt-1 text-xs text-muted-foreground">{t("insights.overDays")} {dateRange} {t("insights.days")}</p>}
          </StatCard>
          <StatCard label={t("insights.averagePerReceipt")} value={loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(summary.averagePerReceipt, currency)} money>
            {!loading && <p className="mt-1 text-xs text-muted-foreground">{t("insights.fromReceipts")} {summary.totalReceipts} {t("insights.receipts")}</p>}
          </StatCard>
          <StatCard label={t("insights.spendingInsights")} value={loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(dailyAvg, currency)} money>
            {!loading && (
              <>
                <p className="mt-1 text-xs text-muted-foreground">{t("insights.dailyAverage")}</p>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("insights.daysRemaining")}</span>
                  <span className="font-medium text-foreground">{summary.daysLeft}</span>
                </div>
              </>
            )}
          </StatCard>
          <StatCard label={t("insights.topVendor")} value={loading ? <Skeleton className="h-8 w-24" /> : (summary.topVendor || t("a11y.notAvailable"))}>
            {!loading && (
              <p className="mt-1 text-xs text-muted-foreground">
                {vendorData.length > 0 && vendorData[0].name !== NO_DATA && summary.totalSpent > 0
                  ? t("insights.percentOfSpending", { percent: ((vendorData[0].value / summary.totalSpent) * 100).toFixed(0) })
                  : t("insights.noDataAvailable")}
              </p>
            )}
          </StatCard>
        </div>

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title={t("insights.monthlySpendingSummary")}>
            <MonthlySummaryPanel
              summary={summary}
              monthlyBudget={monthlyBudget}
              dailyAvg={dailyAvg}
              dailyBudget={dailyBudget}
              overBudget={overBudget}
              budgetUsed={budgetUsed}
              currency={currency}
              loading={loading}
            />
          </ChartCard>

          <ChartCard
            title={t("insights.budgetProgress")}
            action={userSettings ? (
              <Link to="/settings" className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Settings className="h-3 w-3" /> {t("insights.editBudget")}
              </Link>
            ) : null}
          >
            <BudgetProgressPanel
              goalData={goalData}
              totalSpent={summary.totalSpent}
              monthlyBudget={monthlyBudget}
              dailyAvg={dailyAvg}
              dailyBudget={dailyBudget}
              overBudget={overBudget}
              remaining={remaining}
              daysLeft={summary.daysLeft}
              currency={currency}
              loading={loading}
            />
          </ChartCard>
        </div>

        <div className="mb-6">
          <ChartCard title={t("insights.topVendors")}>
            {loading ? (
              <div className="flex h-full items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">{t("insights.loadingChartData")}</p>
              </div>
            ) : (
              <VendorSpendingChart data={vendorData} currency={currency} />
            )}
          </ChartCard>
        </div>
      </div>

      <InsightsReport
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        summary={summary}
        spendingData={spendingData}
        vendorData={vendorData.filter((v) => v.name !== NO_DATA && v.value > 0)}
        dateRange={dateRange}
        currency={currency || "USD"}
        dateSource="receipt"
      />
    </AppLayout>
  );
};

export default Insights;