/** Chart palette mirrors CSS variables in globals.css — keep in sync. */
export const CHART_COLORS_LIGHT = ["#0d9488", "#d946ef", "#14b8a6", "#e879f9", "#2dd4bf"] as const;
export const CHART_COLORS_DARK = ["#2dd4bf", "#e879f9", "#14b8a6", "#d946ef", "#5eead4"] as const;

export function getChartColors(): readonly string[] {
  if (typeof window === "undefined") {
    return CHART_COLORS_LIGHT;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
}
