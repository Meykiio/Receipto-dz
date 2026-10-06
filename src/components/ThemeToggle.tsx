import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Round theme toggle per the design system (border, icon swap).
 * Toggles dark/light explicitly; persists via ThemeContext.
 */
const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-toggle text-primary transition-transform duration-med ease-spring hover:scale-110 hover:border-primary " +
        (className ?? "")
      }
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

export default ThemeToggle;