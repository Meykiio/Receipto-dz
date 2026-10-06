import { useTranslation } from "react-i18next";
import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";

const LAST_UPDATED = "2026-10-06";

/**
 * These documents describe software you run yourself, not a hosted service.
 * Receipto has no servers and no account: everything is stored in a database
 * the user controls, and the only data that can leave the device does so
 * directly to the AI provider the user chose and enabled.
 */
const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const date = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${LAST_UPDATED}T00:00:00Z`));

  const sections: LegalSection[] = [
    { heading: t("legal.privacy.s1"), paragraphs: [t("legal.privacy.s1Body")] },
    {
      heading: t("legal.privacy.s2"),
      paragraphs: [t("legal.privacy.s2Intro")],
      bullets: [
        t("legal.privacy.s2a"),
        t("legal.privacy.s2b"),
        t("legal.privacy.s2c"),
      ],
    },
    {
      heading: t("legal.privacy.s3"),
      paragraphs: [t("legal.privacy.s3Intro")],
      bullets: [
        t("legal.privacy.s3a"),
        t("legal.privacy.s3b"),
        t("legal.privacy.s3c"),
        t("legal.privacy.s3d"),
      ],
    },
    { heading: t("legal.privacy.s4"), paragraphs: [t("legal.privacy.s4Body")] },
    { heading: t("legal.privacy.s5"), paragraphs: [t("legal.privacy.s5Body")] },
    {
      heading: t("legal.privacy.s6"),
      paragraphs: [t("legal.privacy.s6Intro")],
      bullets: [
        t("legal.privacy.s6a"),
        t("legal.privacy.s6b"),
        t("legal.privacy.s6c"),
        t("legal.privacy.s6d"),
      ],
    },
    { heading: t("legal.privacy.s7"), paragraphs: [t("legal.privacy.s7Body")] },
    { heading: t("legal.privacy.s8"), paragraphs: [t("legal.privacy.s8Body")] },
  ];

  return (
    <LegalDocument
      title={t("legal.privacy.title")}
      backToHome={t("legal.backToHome")}
      lastUpdated={t("legal.lastUpdated", { date })}
      sections={sections}
      contact={{
        heading: t("legal.privacy.contactHeading"),
        body: t("legal.privacy.contactBody"),
        email: "notsifeddine@gmail.com",
      }}
    />
  );
};

export default PrivacyPolicy;