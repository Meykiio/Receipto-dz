import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, LayoutDashboard, Shield, Brain, BarChart2, Zap } from "lucide-react";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="flex h-full flex-col overflow-hidden border-border transition-all group hover:shadow-lg hover:shadow-primary/10">
    <CardContent className="flex flex-1 flex-col p-8">
      <div className="mb-6 w-fit rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold transition-colors group-hover:text-primary">{title}</h3>
      <p className="text-muted-foreground transition-colors group-hover:text-foreground/90">{description}</p>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
    </CardContent>
  </Card>
);

const FeaturesSection = () => {
  const { t } = useTranslation();
  const features = [
    { icon: <Brain className="h-6 w-6 text-primary" />, title: t("landing.f1Title"), description: t("landing.f1Desc") },
    { icon: <BarChart2 className="h-6 w-6 text-primary" />, title: t("landing.f2Title"), description: t("landing.f2Desc") },
    { icon: <Zap className="h-6 w-6 text-primary" />, title: t("landing.f3Title"), description: t("landing.f3Desc") },
    { icon: <FileText className="h-6 w-6 text-primary" />, title: t("landing.f4Title"), description: t("landing.f4Desc") },
    { icon: <LayoutDashboard className="h-6 w-6 text-primary" />, title: t("landing.f5Title"), description: t("landing.f5Desc") },
    { icon: <Shield className="h-6 w-6 text-primary" />, title: t("landing.f6Title"), description: t("landing.f6Desc") },
  ];

  return (
    <section className="overflow-hidden py-24" id="features">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("landing.featuresTitle")}</h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">{t("landing.featuresDesc")}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;