import { useTranslation } from "react-i18next";
import { CheckCircle, Coffee, Clock, Smile } from "lucide-react";

const GlobalAdoption = () => {
  const { t } = useTranslation();
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h3 className="mb-8 text-2xl font-semibold">{t("landing.adoptionTitle")}</h3>
        <div className="mb-12 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-4">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-medium">{t("landing.adoptionBenefit1")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-4">
            <Coffee className="h-5 w-5 text-primary" />
            <span className="font-medium">{t("landing.adoptionBenefit2")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-4">
            <Smile className="h-5 w-5 text-primary" />
            <span className="font-medium">{t("landing.adoptionBenefit3")}</span>
          </div>
        </div>

        <h4 className="mb-6 text-xl font-semibold">{t("landing.adoptionSubtitle")}</h4>

        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-positive" />
            <span>{t("landing.adoptionItem1")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-positive" />
            <span>{t("landing.adoptionItem2")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-positive" />
            <span>{t("landing.adoptionItem3")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalAdoption;