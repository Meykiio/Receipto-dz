import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setAppLocale, type SupportedLocale } from "@/i18n";

const OPTIONS: Array<{ code: SupportedLocale; label: string }> = [
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

/**
 * Language switcher (ar/fr/en). Used on the landing page and on the public
 * legal routes. setAppLocale persists the choice and flips document direction
 * (RTL for Arabic) immediately.
 */
const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const current = i18n.language as SupportedLocale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-primary"
          aria-label={t("common.changeLanguage")}
        >
          <Languages className="h-4 w-4" />
          <span className="hidden text-xs font-semibold sm:inline">
            {OPTIONS.find((o) => o.code === current)?.label ?? "English"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.code}
            onClick={() => setAppLocale(opt.code)}
            className={opt.code === current ? "bg-primary/10 text-primary" : undefined}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
