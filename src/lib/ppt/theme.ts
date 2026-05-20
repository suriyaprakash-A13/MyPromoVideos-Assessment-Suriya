/** Dark executive theme — aligned with app dark mode palette. */
export const COLORS = {
  bg: "0B1020",
  bg2: "10192E",
  panel: "15203A",
  panel2: "1A2744",
  panel3: "223155",
  line: "344466",
  text: "F8FAFC",
  muted: "A7B4D1",
  purple: "8B5CF6",
  violet: "C084FC",
  cyan: "22D3EE",
  gold: "FBBF24",
  green: "34D399",
  red: "F87171",
  magenta: "D946EF",
  white: "FFFFFF",
  inkSoft: "DCE7FF"
} as const;

export const FONTS = {
  display: "Segoe UI",
  body: "Calibri"
} as const;

export const TYPOGRAPHY = {
  coverTitle: 32,
  slideTitle: 24,
  sectionTitle: 14,
  cardTitle: 13,
  body: 11,
  bodySm: 9.5,
  caption: 9,
  footnote: 8,
  metricValue: 22,
  pill: 7.8
} as const;

export const CHART_SERIES = [
  COLORS.purple,
  COLORS.cyan,
  COLORS.green,
  COLORS.gold,
  COLORS.violet,
  COLORS.red
] as const;

export const BRAND = {
  name: "Mypromovdos video intelligence",
  deckTitle: "Video Marketing Intelligence Report"
} as const;

export const TOTAL_SLIDES = 13;

/**
 * pptxgenjs does not expose slide transitions in its public API.
 * Per-object entrance animations are omitted for cross-app compatibility.
 */
