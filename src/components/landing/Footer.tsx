import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40 py-12 dark:bg-card">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-center justify-between md:flex-row">
          <div className="mb-6 flex items-center md:mb-0">
            <img src="/logo.svg" alt="Receipto Logo" className="h-8 w-8 me-3" />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold text-transparent">Receipto</span>
          </div>

          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{t("landing.footerFeatures")}</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{t("landing.footerHow")}</a>
            <a href="#vision" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{t("landing.footerVision")}</a>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary">{t("landing.footerPrivacy")}</Link>
              <Link to="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary">{t("landing.footerTerms")}</Link>
            </div>
            <p className="text-xs text-muted-foreground">© {currentYear} Receipto. {t("landing.footerRights")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;