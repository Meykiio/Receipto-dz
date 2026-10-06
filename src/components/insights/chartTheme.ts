import { useTheme } from "@/contexts/ThemeContext";

/**
 * Resolve the current chart palette from the app's CSS design tokens.
 * Reads the live CSS variables so charts follow light/dark automatically.
 */
const getCss = (name: string): string => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : "currentColor";
};

export interface ChartTheme {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  series: string;
  seriesLight: string;
  positive: string;
  warning: string;
  danger: string;
  gaugeTrack: string;
  textMuted: string;
}

export const resolveChartTheme = (): ChartTheme => ({
  grid: "hsl(var(--border) / 0.5)",
  axis: "hsl(var(--muted-foreground))",
  tooltipBg: "hsl(var(--popover))",
  tooltipBorder: "hsl(var(--border))",
  tooltipText: "hsl(var(--popover-foreground))",
  series: getCss("--primary"),
  seriesLight: getCss("--brand-blue"),
  positive: getCss("--positive"),
  warning: getCss("--secondary"),
  danger: getCss("--destructive"),
  gaugeTrack: "hsl(var(--muted))",
  textMuted: "hsl(var(--muted-foreground))",
});

/**
 * Hook that returns the chart theme and re-resolves it when the theme changes.
 */
export const useChartTheme = (): ChartTheme => {
  const { theme } = useTheme();
  // Recompute whenever the resolved dark/light class changes.
  const isDark = typeof document !== "undefined"
    ? document.documentElement.classList.contains("dark")
    : false;
  // Dependency on theme + isDark is enough: toggling theme re-renders.
  void theme;
  void isDark;
  return resolveChartTheme();
};

// Semantic series palette (emerald family + supporting accents), reused by all charts.
export const SERIES_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--brand-blue))",
  "hsl(var(--secondary))",
  "hsl(var(--tertiary))",
  "hsl(var(--quaternary))",
  "hsl(var(--positive))",
];