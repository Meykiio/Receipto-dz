import { useTranslation } from "react-i18next";
import { Lock, Heart, ThumbsUp } from "lucide-react";

const GlobalCompliance = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-muted/40 py-16 dark:bg-card">
      <div className="container mx-auto px-4 text-center">
        <h3 className="mb-4 text-2xl font-semibold">{t("landing.complianceTitle")}</h3>
        <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">{t("landing.complianceDesc")}</p>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="rounded-lg bg-background p-4 shadow-sm">
            <Lock className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="font-medium">{t("landing.compliance1")}</p>
          </div>
          <div className="rounded-lg bg-background p-4 shadow-sm">
            <Heart className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="font-medium">{t("landing.compliance2")}</p>
          </div>
          <div className="rounded-lg bg-background p-4 shadow-sm">
            <ThumbsUp className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="font-medium">{t("landing.compliance3")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalCompliance;