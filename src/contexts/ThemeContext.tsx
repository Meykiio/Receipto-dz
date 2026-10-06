import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isInitialized: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark" || stored === "system") return stored as Theme;
      return "light";
    } catch {
      return "light";
    }
  });

  // Apply theme to document root
  useEffect(() => {
    try {
      const root = document.documentElement;
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      let applied: "dark" | "light" = "light";
      
      if (theme === "system") {
        applied = systemDark ? "dark" : "light";
      } else {
        applied = theme;
      }
      
      // Apply or remove dark class
      if (applied === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.error("Error applying theme:", e);
    } finally {
      setIsInitialized(true);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    
    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const root = document.documentElement;
        if (mediaQuery.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } catch (e) {
      console.error("Error setting up theme listener:", e);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    try {
      setThemeState(t);
      localStorage.setItem("theme", t);
    } catch (e) {
      console.error("Error updating theme:", e);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isInitialized }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
