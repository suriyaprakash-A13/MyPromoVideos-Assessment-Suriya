import PptxGenJS from "pptxgenjs";
import { COLORS, CHART_SERIES, FONTS } from "@/lib/ppt/theme";
import { Rect } from "@/lib/ppt/types";

type ChartData = PptxGenJS.OptsChartData[];
type ChartOptions = PptxGenJS.IChartOpts;

export function themedChartOptions(rect: Rect, overrides: ChartOptions = {}): ChartOptions {
  return {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    chartColors: [...CHART_SERIES],
    chartArea: { fill: { color: COLORS.panel2 } },
    plotArea: { fill: { color: COLORS.panel } },
    valGridLine: { color: COLORS.line, style: "solid" },
    catGridLine: { color: COLORS.line, style: "solid" },
    catAxisLabelColor: COLORS.text,
    valAxisLabelColor: COLORS.text,
    catAxisLabelFontSize: 9,
    valAxisLabelFontSize: 9,
    catAxisLabelFontFace: FONTS.body,
    valAxisLabelFontFace: FONTS.body,
    legendColor: COLORS.text,
    legendFontFace: FONTS.body,
    legendFontSize: 9,
    showLegend: true,
    legendPos: "b",
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
  slide.addChart(type, data, themedChartOptions(rect, overrides));
}
