import { useTranslation } from "react-i18next";

const Testimonials = () => {
  const { t } = useTranslation();
  const testimonials = [
    {
      quote: t("landing.t1Quote"),
      name: t("landing.t1Name"),
      title: t("landing.t1Title"),
      color: "bg-primary",
      initials: "AK",
    },
    {
      quote: t("landing.t2Quote"),
      name: t("landing.t2Name"),
      title: t("landing.t2Title"),
      color: "bg-positive",
      initials: "MG",
    },
    {
      quote: t("landing.t3Quote"),
      name: t("landing.t3Name"),
      title: t("landing.t3Title"),
      color: "bg-secondary",
      initials: "ST",
    },
  ];

  return (
    <section className="bg-muted/40 py-24 dark:bg-card">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("landing.testimonialsTitle")}</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">{t("landing.testimonialsDesc")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-md">
              <div className="mb-4 text-xl italic">&ldquo;{testimonial.quote}&rdquo;</div>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow ${testimonial.color}`}>
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;