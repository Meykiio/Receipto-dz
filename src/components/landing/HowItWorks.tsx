import { useTranslation } from "react-i18next";
import {
  ScanLine,
  BrainCircuit,
  Boxes,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

/**
 * Bento-style grid rather than a vertical timeline. A five-step vertical
 * rail reads as a dated "how it works" list; a card grid keeps the same content
 * scannable and gives each step its own visual anchor.
 *
 * Rhythm: three equal cards on the first row, then two full-width cards, so
 * the five steps fill the grid exactly with no orphan gap.
 */
const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: ScanLine, title: t("landing.step1Title"), description: t("landing.step1Desc") },
    { icon: BrainCircuit, title: t("landing.step2Title"), description: t("landing.step2Desc") },
    { icon: Boxes, title: t("landing.step3Title"), description: t("landing.step3Desc") },
    { icon: TrendingUp, title: t("landing.step4Title"), description: t("landing.step4Desc") },
    { icon: RefreshCw, title: t("landing.step5Title"), description: t("landing.step5Desc") },
  ];

  const spanFor = (index: number) =>
    index < 3 ? "lg:col-span-2" : "lg:col-span-3";

  return (
    <section className="bg-card py-24" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="mb-14 max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("landing.howTitle")}</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t("landing.howDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={index}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 ${spanFor(index)}`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="relative mb-2 text-lg font-semibold leading-snug">
                  {step.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#features"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {t("landing.howSeeFeatures")}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;