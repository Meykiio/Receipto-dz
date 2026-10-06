import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

const VisionPreview = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto my-12 max-w-3xl rounded-2xl border border-border bg-muted/50 p-0 shadow-2xl backdrop-blur-sm" style={{ minHeight: "260px" }}>
      <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-tr from-primary/10 via-brand-blue/10 to-brand-blue/10 opacity-60 blur-2xl" aria-hidden="true" />
      <div className="flex h-full flex-col items-center justify-center p-10 text-center">
        <div className="mb-4">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-blue shadow-lg">
            <Sparkles className="h-8 w-8 text-white drop-shadow" />
          </span>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-primary md:text-3xl">{t("landing.visionPreviewTitle")}</h3>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">{t("landing.visionPreviewDesc")}</p>
      </div>
    </div>
  );
};

export default VisionPreview;