import { useTranslation } from "react-i18next";
import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";

const LAST_UPDATED = "2026-10-06";

/**
 * These documents describe software you run yourself, not a hosted service.
 * The user installs, hosts, secures, and operates their own copy and is the
 * data controller for it; the authors operate no service.
 */
const TermsOfService = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const date = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${LAST_UPDATED}T00:00:00Z`));

  const sections: LegalSection[] = [
    { heading: t("legal.terms.s1"), paragraphs: [t("legal.terms.s1Body")] },
    { heading: t("legal.terms.s2"), paragraphs: [t("legal.terms.s2Body")] },
    { heading: t("legal.terms.s3"), paragraphs: [t("legal.terms.s3Body")] },
    { heading: t("legal.terms.s4"), paragraphs: [t("legal.terms.s4Body")] },
    { heading: t("legal.terms.s5"), paragraphs: [t("legal.terms.s5Body")] },
    { heading: t("legal.terms.s6"), paragraphs: [t("legal.terms.s6Body")] },
    {
      heading: t("legal.terms.s7"),
      paragraphs: [t("legal.terms.s7Intro")],
      bullets: [
        t("legal.terms.s7a"),
        t("legal.terms.s7b"),
        t("legal.terms.s7c"),
        t("legal.terms.s7d"),
        t("legal.terms.s7e"),
      ],
    },
    { heading: t("legal.terms.s8"), paragraphs: [t("legal.terms.s8Body")] },
    { heading: t("legal.terms.s9"), paragraphs: [t("legal.terms.s9Body")] },
    { heading: t("legal.terms.s10"), paragraphs: [t("legal.terms.s10Body")] },
  ];

  return (
    <LegalDocument
      title={t("legal.terms.title")}
      backToHome={t("legal.backToHome")}
      lastUpdated={t("legal.lastUpdated", { date })}
      sections={sections}
      contact={{
        heading: t("legal.terms.contactHeading"),
        body: t("legal.terms.contactBody"),
        email: "notsifeddine@gmail.com",
      }}
    />
  );
};

export default TermsOfService;