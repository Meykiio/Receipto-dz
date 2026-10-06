import { useTranslation } from "react-i18next";
import VisionPreview from "./VisionPreview";

const VisionSection = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-card py-24" id="vision">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("landing.visionTitle")}</h2>
            <p className="mb-6 text-xl text-muted-foreground">{t("landing.visionDesc")}</p>
            <p className="text-muted-foreground">{t("landing.visionBody")}</p>
          </div>
          <div className="order-1 md:order-2">
            <VisionPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;