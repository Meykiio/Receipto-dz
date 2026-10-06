import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Package, Wallet, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/30 pt-20 pb-16">
      <div className="absolute left-[-10rem] top-[-6rem] h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-60" aria-hidden="true" />
      <div className="absolute bottom-[-8rem] right-[-10rem] h-96 w-96 rounded-full bg-brand-blue/20 blur-3xl opacity-40" aria-hidden="true" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col text-start">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold tracking-wide text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden="true" />
              {t("landing.heroBadge")}
            </div>

            <h1 className="text-4xl font-bold leading-[0.96] tracking-tight md:text-5xl lg:text-6xl">
              {t("landing.heroTitle1")}<br />
              <span className="text-primary">{t("landing.heroTitle2")}</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {t("landing.heroDesc")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="border-primary/20 bg-primary/10 px-3 py-1 font-semibold text-foreground">
                <Package className="me-1 h-3 w-3 text-primary" /> {t("landing.heroBadgeAuto")}
              </Badge>
              <Badge className="border-positive/30 bg-positive/10 px-3 py-1 font-semibold text-foreground">
                <Wallet className="me-1 h-3 w-3 text-positive" /> {t("landing.heroBadgeBudget")}
              </Badge>
              <Badge className="border-brand-blue/30 bg-brand-blue/10 px-3 py-1 font-semibold text-foreground">
                <Sparkles className="me-1 h-3 w-3 text-brand-blue" /> {t("landing.heroBadgeAi")}
              </Badge>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild className="h-12 px-6 text-base font-semibold">
                <Link to="/auth" className="flex items-center gap-2">
                  {t("landing.heroCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6 text-base font-semibold">
                <Link to="/auth?tab=login">{t("landing.navLogin")}</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("landing.heroSpentLabel")}</p>
                    <p className="font-display text-lg font-bold text-primary">48,250 DA</p>
                  </div>
                </div>
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-3 w-3 rounded-full bg-destructive/70" />
                  <span className="h-3 w-3 rounded-full bg-secondary/70" />
                  <span className="h-3 w-3 rounded-full bg-positive/70" />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: t("landing.heroRow1"), sub: t("landing.heroRow1Sub"), amount: "3,600 DA" },
                  { label: t("landing.heroRow2"), sub: t("landing.heroRow2Sub"), amount: "12,500 DA" },
                  { label: t("landing.heroRow3"), sub: t("landing.heroRow3Sub"), amount: "2,340 DA" },
                ].map((row) => (
                  <div key={row.label} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{row.label}</span>
                      <span className="font-display text-sm font-bold text-primary">{row.amount}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{row.sub}</div>
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

export default HeroSection;