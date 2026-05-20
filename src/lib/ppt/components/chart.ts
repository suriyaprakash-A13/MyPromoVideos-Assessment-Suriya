import PptxGenJS from "pptxgenjs";
import { COLORS, CHART_SERIES, FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";
import { Rect } from "@/lib/ppt/types";
import { panelRect } from "@/lib/ppt/components/shapes";

type ChartData = PptxGenJS.OptsChartData[];
type ChartOptions = PptxGenJS.IChartOpts;

function isBarChart(type: PptxGenJS.CHART_NAME): boolean {
  return String(type).toLowerCase().includes("bar");
}

function extractChartValues(data: ChartData): number[] {
  return data.flatMap((series) =>
    (series.values ?? []).map((value) => Number(value)).filter((value) => Number.isFinite(value))
  );
}

function roundAxisBound(value: number): number {
  if (value >= 1_000_000) {
    return Math.ceil(value / 50_000) * 50_000;
  }
  if (value >= 10_000) {
    return Math.ceil(value / 1_000) * 1_000;
  }
  if (value >= 100) {
    return Math.ceil(value / 10) * 10;
  }
  if (value >= 1) {
    return Math.ceil(value * 10) / 10;
  }
  return Math.ceil(value * 100) / 100;
}

/** Widen scale so small bars stay visible; use log when spread is extreme. */
function buildValueAxisScale(data: ChartData): ChartOptions {
  const values = extractChartValues(data);
  if (!values.length) {
    return {};
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max <= 0) {
    return { valAxisMinVal: 0, valAxisMaxVal: 1 };
  }

  const positive = values.filter((value) => value > 0);
  const posMin = positive.length ? Math.min(...positive) : max;
  const ratio = max / Math.max(posMin, 1);

  if (ratio >= 12 && positive.length > 0) {
    return { valAxisLogScaleBase: 10 };
  }

  const span = max - Math.min(0, min);
  const padding = span * 0.12;
  const axisMin = min >= 0 && ratio >= 3 ? Math.max(0, min - padding) : 0;
  const axisMax = max + padding;

  return {
    valAxisMinVal: roundAxisBound(axisMin),
    valAxisMaxVal: roundAxisBound(axisMax)
  };
}

const BAR_LABEL_DEFAULTS: ChartOptions = {
  showValue: true,
  dataLabelPosition: "outEnd",
  dataLabelColor: COLORS.ink,
  dataLabelFontFace: FONTS.body,
  dataLabelFontSize: TYPOGRAPHY.captionMd,
  dataLabelFormatCode: "#,##0"
};

export function themedChartOptions(
  rect: Rect,
  type: PptxGenJS.CHART_NAME,
  data: ChartData,
  overrides: ChartOptions = {}
): ChartOptions {
  const barLabels = isBarChart(type) ? BAR_LABEL_DEFAULTS : {};
  const axisScale = isBarChart(type) ? buildValueAxisScale(data) : {};

  return {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    chartColors: [...CHART_SERIES],
    chartArea: {
      fill: { color: COLORS.white },
      roundedCorners: true
    },
    plotArea: { fill: { color: COLORS.panelTeal } },
    valGridLine: { color: COLORS.lineSoft, style: "solid", size: 0.5 },
    catGridLine: { color: COLORS.lineSoft, style: "solid", size: 0.5 },
    catAxisLabelColor: COLORS.muted,
    valAxisLabelColor: COLORS.muted,
    catAxisLabelFontSize: TYPOGRAPHY.caption,
    valAxisLabelFontSize: TYPOGRAPHY.caption,
    catAxisLabelFontFace: FONTS.body,
    valAxisLabelFontFace: FONTS.body,
    legendColor: COLORS.text,
    legendFontFace: FONTS.body,
    legendFontSize: TYPOGRAPHY.caption,
    barGapWidthPct: 28,
    barGrouping: "clustered",
    showLegend: true,
    legendPos: "b",
    ...axisScale,
    ...barLabels,
    ...overrides
  };
}

export function addThemedChart(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  type: PptxGenJS.CHART_NAME,
  data: ChartData,
  rect: Rect,
  overrides: ChartOptions = {}
): void {
  const frame = insetChartFrame(rect);
  panelRect(slide, frame, COLORS.white, COLORS.lineSoft);
  slide.addChart(type, data, themedChartOptions(frame, type, data, overrides));
}

function insetChartFrame(rect: Rect): Rect {
  return {
    x: rect.x + 0.06,
    y: rect.y + 0.06,
    w: rect.w - 0.12,
    h: rect.h - 0.12
  };
}
