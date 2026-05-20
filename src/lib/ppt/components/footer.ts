import PptxGenJS from "pptxgenjs";
import { COLORS, TYPOGRAPHY } from "@/lib/ppt/theme";
import { MARGIN_X, CONTENT_BOTTOM } from "@/lib/ppt/layout";
import { textBlock } from "@/lib/ppt/components/text";

export function renderFooterLabel(slide: PptxGenJS.Slide, label: string, y = CONTENT_BOTTOM + 0.13): void {
  textBlock({
    slide,
    rect: { x: MARGIN_X, y, w: 3.2, h: 0.18 },
    text: label,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted,
    valign: "middle"
  });
}

export function renderFooterBullets(slide: PptxGenJS.Slide, lines: string[], y = CONTENT_BOTTOM + 0.32): void {
  const bullets = lines.slice(0, 3).map((line) => `• ${line}`).join("\n");

  textBlock({
    slide,
    rect: { x: MARGIN_X, y, w: 12.0, h: 0.55 },
    text: bullets,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.text,
    lineSpacing: 14
  });
}

export function renderFooterNote(slide: PptxGenJS.Slide, note: string, y = CONTENT_BOTTOM + 0.32): void {
  textBlock({
    slide,
    rect: { x: MARGIN_X, y, w: 12.0, h: 0.28 },
    text: note,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.text
  });
}
