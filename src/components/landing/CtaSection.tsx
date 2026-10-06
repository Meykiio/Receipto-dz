import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CtaSection = () => {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden bg-primary/5 py-24 dark:bg-card/10">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("landing.ctaTitle")}</h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-muted-foreground">{t("landing.ctaDesc")}</p>
        </div>

        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild className="h-12">
                <Link to="/auth" className="flex items-center gap-2">
                  {t("landing.ctaCreate")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12">
                <Link to="/auth?tab=login" className="flex items-center gap-2">
                  {t("landing.navLogin")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;