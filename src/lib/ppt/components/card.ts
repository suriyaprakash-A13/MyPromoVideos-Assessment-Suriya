import PptxGenJS from "pptxgenjs";
import { COLORS, FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";
import { Rect } from "@/lib/ppt/types";
import { panelRect, accentBar } from "@/lib/ppt/components/shapes";
import { textBlock } from "@/lib/ppt/components/text";

export function renderCard(
  slide: PptxGenJS.Slide,
  rect: Rect,
  accent: string,
  title: string,
  body: string,
  titleSize: number = TYPOGRAPHY.cardTitle,
  bodySize: number = TYPOGRAPHY.bodySm
): void {
  panelRect(slide, rect, COLORS.panel);
  accentBar(slide, rect, accent);

  textBlock({
    slide,
    rect: { x: rect.x + 0.24, y: rect.y + 0.1, w: rect.w - 0.34, h: 0.35 },
    text: title,
    fontFace: FONTS.display,
    fontSize: titleSize,
    color: COLORS.white,
    bold: true,
    valign: "middle"
  });

  textBlock({
    slide,
    rect: { x: rect.x + 0.24, y: rect.y + 0.5, w: rect.w - 0.34, h: rect.h - 0.55 },
    text: body,
    fontSize: bodySize,
    color: COLORS.muted,
    lineSpacing: 16,
    margin: [2, 0, 2, 0]
  });
}

export function renderMetricCard(
  slide: PptxGenJS.Slide,
  rect: Rect,
  label: string,
  value: string,
  detail: string,
  accent: string
): void {
  panelRect(slide, rect, COLORS.panel2);
  accentBar(slide, rect, accent);

  textBlock({
    slide,
    rect: { x: rect.x + 0.2, y: rect.y + 0.1, w: rect.w - 0.3, h: 0.25 },
    text: label,
    fontSize: TYPOGRAPHY.bodySm,
    color: COLORS.muted,
    valign: "middle"
  });

  textBlock({
    slide,
    rect: { x: rect.x + 0.2, y: rect.y + 0.35, w: rect.w - 0.3, h: 0.35 },
    text: value,
    fontFace: FONTS.display,
    fontSize: TYPOGRAPHY.metricValue,
    color: COLORS.white,
    bold: true,
    valign: "middle"
  });

  textBlock({
    slide,
    rect: { x: rect.x + 0.2, y: rect.y + 0.65, w: rect.w - 0.3, h: rect.h - 0.7 },
    text: detail,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted,
    lineSpacing: 14,
    margin: [2, 0, 0, 0]
  });
}
