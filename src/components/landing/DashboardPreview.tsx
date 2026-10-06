import { useTranslation } from "react-i18next";
import { BarChart2, FileText, Users, CreditCard } from "lucide-react";

const DashboardPreview = () => {
  const { t } = useTranslation();
  const summaryCards = [
    { label: t("landing.dashboardItems"), value: "1,245", icon: <FileText className="h-6 w-6 text-primary" />, color: "bg-brand-blue/10 text-brand-blue" },
    { label: t("landing.dashboardValue"), value: "23,400 DA", icon: <CreditCard className="h-6 w-6 text-positive" />, color: "bg-positive/10 text-positive" },
    { label: t("landing.dashboardSuppliers"), value: "32", icon: <Users className="h-6 w-6 text-secondary" />, color: "bg-secondary/10 text-secondary" },
    { label: t("landing.dashboardAlerts"), value: "7", icon: <BarChart2 className="h-6 w-6 text-tertiary" />, color: "bg-tertiary/10 text-tertiary" },
  ];

  const tableRows = [
    { vendor: "Atlas Logistics", amount: "125 units" },
    { vendor: "MedEquip Group", amount: "48 units" },
    { vendor: "FreshMart Retail", amount: "76 units" },
    { vendor: "Tech Supplies", amount: "32 units" },
  ];

  return (
    <div className="relative mx-auto my-16 max-w-6xl overflow-hidden rounded-2xl border border-border bg-muted/50 shadow-2xl backdrop-blur-sm p-0">
      <div className="flex items-center justify-end p-6 pb-0">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <div className="h-3 w-3 rounded-full bg-secondary" />
          <div className="h-3 w-3 rounded-full bg-positive" />
        </div>
      </div>

      <div className="p-8 pt-0">
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card, i) => (
              <div key={i} className={`flex items-center gap-4 rounded-xl bg-card/80 p-6 shadow ${card.color}`}>
                <div className="scale-125">{card.icon}</div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{card.label}</div>
                  <div className="text-2xl font-bold">{card.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl bg-card/80 p-6 shadow">
            <div className="mb-4 text-lg font-bold text-primary">{t("landing.dashboardTableTitle")}</div>
            <div className="min-w-full overflow-hidden">
              <table className="w-full text-base">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="pb-3 text-start font-medium">{t("landing.dashboardSupplier")}</th>
                    <th className="pb-3 text-end font-medium">{t("landing.dashboardStockLevel")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="whitespace-nowrap py-3">{row.vendor}</td>
                      <td className="text-end font-bold">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-primary/30 blur-3xl opacity-60" aria-hidden="true" />
    </div>
  );
};

export default DashboardPreview;