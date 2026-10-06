import { useTranslation } from "react-i18next";

const ProblemSolution = () => {
  const { t } = useTranslation();
  const problems = [
    {
      label: t("landing.problemCard1"),
      amount: "$1,200.00",
      color: "text-destructive",
      icon: (
        <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      ),
      date: "2025-05-07",
    },
    {
      label: t("landing.problemCard2"),
      amount: "$850.00",
      color: "text-secondary",
      icon: (
        <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
      date: "2025-05-05",
    },
    {
      label: t("landing.problemCard3"),
      amount: "$300.00",
      color: "text-foreground",
      icon: (
        <svg className="h-6 w-6 text-tertiary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414M15 9h.01M9 15h.01" /></svg>
      ),
      date: "2025-05-03",
    },
    {
      label: t("landing.problemCard4"),
      amount: "$75.00",
      color: "text-primary",
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8" /></svg>
      ),
      date: "2025-05-02",
    },
  ];

  return (
    <section className="py-24 bg-muted/40 dark:bg-card">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.problemTitle")}</h2>
            <p className="text-xl text-muted-foreground mb-6">{t("landing.problemDesc")}</p>
            <ul className="list-disc ps-5 text-muted-foreground">
              {[t("landing.problemList1"), t("landing.problemList2"), t("landing.problemList3"), t("landing.problemList4"), t("landing.problemList5")].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="order-2 md:order-1">
            <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-6 shadow-lg border border-border backdrop-blur-sm">
              <div className="flex items-center justify-end mb-6">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-secondary" />
                  <div className="h-3 w-3 rounded-full bg-positive" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {problems.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl bg-card/80 p-4 shadow-sm">
                    <div className="shrink-0">{p.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="truncate text-base font-semibold">{p.label}</span>
                        <span className={`text-base font-bold ${p.color}`}>{p.amount}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{p.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;