/** Light theme — teal, magenta, and pink accents only. */
export const COLORS = {
  bg: "F8FAFC",
  bg2: "F0FDFA",
  panel: "FFFFFF",
  panel2: "F8FAFC",
  panel3: "F0FDFA",
  panelTeal: "CCFBF1",
  panelMagenta: "FCE7F3",
  panelPink: "FDF2F8",
  line: "99F6E4",
  lineSoft: "E2E8F0",
  text: "0F172A",
  muted: "64748B",
  ink: "0F172A",
  teal: "0D9488",
  cyan: "14B8A6",
  magenta: "D946EF",
  pink: "EC4899",
  white: "FFFFFF",
  inkSoft: "115E59",
  inkPink: "9D174D",
  /** Text on saturated accent fills (badges, table headers). */
  onAccent: "FFFFFF"
} as const;

export const ACCENT_CYCLE = [
  COLORS.teal,
  COLORS.magenta,
  COLORS.pink,
  COLORS.teal,
  COLORS.magenta,
  COLORS.pink
] as const;

export const FONTS = {
  display: "Calibri Light",
  body: "Calibri",
  fallback: "Arial"
} as const;

export const TYPOGRAPHY = {
  coverTitle: 34,
  coverSubtitle: 19,
  slideTitle: 22,
  slideSubtitle: 11,
  sectionTitle: 14,
  cardTitle: 13,
  body: 12,
  bodyMd: 12,
  bodyLg: 13,
  bodySm: 11,
  caption: 10,
  captionMd: 11,
  footnote: 9,
  footer: 12,
  tableHeader: 11,
  tableCell: 12,
  metricValue: 18,
  metricValueMd: 16,
  metricValueSm: 14,
  pill: 9
} as const;

export const LINE_SPACING = {
  tight: 15,
  normal: 17,
  relaxed: 20,
  loose: 22
} as const;

export const CHART_SERIES = [
  COLORS.teal,
  COLORS.magenta,
  COLORS.pink,
  COLORS.teal,
  COLORS.magenta,
  COLORS.pink
] as const;

export const BRAND = {
  name: "Mypromovdos video intelligence",
  deckTitle: "Video Marketing Intelligence Report"
} as const;

export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;

export const ACCENT_BAR_W = 0.06;
export const PANEL_RADIUS = 0.08;

export const TOTAL_SLIDES = 14;
