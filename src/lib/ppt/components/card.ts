import PptxGenJS from "pptxgenjs";
import { COLORS, FONTS, TYPOGRAPHY, LINE_SPACING, ACCENT_BAR_W } from "@/lib/ppt/theme";
import { Rect } from "@/lib/ppt/types";
import { panelRect, accentBar } from "@/lib/ppt/components/shapes";
import { textBlock } from "@/lib/ppt/components/text";

const CARD_PAD_X = 0.24;
const CARD_PAD_TOP = 0.14;

export function renderCard(
  slide: PptxGenJS.Slide,
  rect: Rect,
  accent: string,
  title: string,
  body: string,
  titleSize: number = TYPOGRAPHY.cardTitle,
  bodySize: number = TYPOGRAPHY.bodyMd
): void {
  panelRect(slide, rect, COLORS.panel);
  accentBar(slide, rect, accent);

  const textX = rect.x + CARD_PAD_X + ACCENT_BAR_W + 0.08;
  const textW = rect.w - (textX - rect.x) - 0.16;
  const titleH = Math.min(0.44, rect.h * 0.28);
  const bodyY = rect.y + CARD_PAD_TOP + titleH + 0.08;
  const bodyH = Math.max(0.35, rect.y + rect.h - bodyY - CARD_PAD_TOP);

  textBlock({
    slide,
    rect: { x: textX, y: rect.y + CARD_PAD_TOP, w: textW, h: titleH },
    text: title,
    fontFace: FONTS.display,
    fontSize: titleSize,
    color: COLORS.ink,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: textX, y: bodyY, w: textW, h: bodyH },
    text: body,
    fontSize: bodySize,
    color: COLORS.muted,
    lineSpacing: LINE_SPACING.relaxed,
    valign: "top",
    margin: [4, 2, 4, 2],
    fit: "shrink"
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
  panelRect(slide, rect, COLORS.panel, COLORS.lineSoft);
  accentBar(slide, rect, accent);

  const textX = rect.x + 0.18 + ACCENT_BAR_W + 0.06;
  const textW = rect.w - (textX - rect.x) - 0.12;
  const labelH = 0.28;
  const valueH = Math.min(0.46, rect.h * 0.38);
  const compact = rect.h < 0.95;
  const detailH = Math.max(0.28, rect.h - labelH - valueH - 0.14);
  let valueSize: number = compact ? TYPOGRAPHY.metricValueSm : TYPOGRAPHY.metricValueMd;
  if (value.length > 16) {
    valueSize = TYPOGRAPHY.metricValueSm;
  } else if (!compact && value.length <= 10) {
    valueSize = TYPOGRAPHY.metricValue;
  }
  const detailSize = compact || detail.length > 42 ? TYPOGRAPHY.captionMd : TYPOGRAPHY.bodyMd;

  textBlock({
    slide,
    rect: { x: textX, y: rect.y + 0.08, w: textW, h: labelH },
    text: label.toUpperCase(),
    fontSize: TYPOGRAPHY.captionMd,
    color: COLORS.muted,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: textX, y: rect.y + 0.08 + labelH, w: textW, h: valueH },
    text: value,
    fontFace: FONTS.display,
    fontSize: valueSize,
    color: COLORS.ink,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: textX, y: rect.y + 0.08 + labelH + valueH, w: textW, h: detailH },
    text: detail,
    fontSize: detailSize,
    color: COLORS.muted,
    lineSpacing: LINE_SPACING.tight,
    valign: "top",
    margin: [2, 0, 2, 0],
    fit: "shrink"
  });
}
