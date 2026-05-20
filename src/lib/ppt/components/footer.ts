import PptxGenJS from "pptxgenjs";
import { COLORS, FONTS, TYPOGRAPHY, LINE_SPACING } from "@/lib/ppt/theme";
import { FOOTER_LABEL_Y, MARGIN_X, CONTENT_W, footerNoteRect } from "@/lib/ppt/layout";
import { textBlock } from "@/lib/ppt/components/text";

export function renderFooterLabel(slide: PptxGenJS.Slide, label: string): void {
  renderSectionLabel(slide, label, FOOTER_LABEL_Y);
}

export function renderSectionLabel(slide: PptxGenJS.Slide, label: string, y: number): void {
  textBlock({
    slide,
    rect: { x: MARGIN_X, y, w: CONTENT_W, h: 0.2 },
    text: label,
    fontFace: FONTS.display,
    fontSize: TYPOGRAPHY.footer,
    color: COLORS.muted,
    bold: true,
    valign: "middle"
  });
}

export function renderFooterBullets(slide: PptxGenJS.Slide, lines: string[]): void {
  const rect = footerNoteRect();
  const items = lines.slice(0, 6).map((line) => `• ${line}`);

  if (items.length <= 3) {
    textBlock({
      slide,
      rect,
      text: items.join("\n"),
      fontSize: TYPOGRAPHY.footer,
      color: COLORS.text,
      lineSpacing: LINE_SPACING.relaxed,
      valign: "top",
      fit: "shrink"
    });
    return;
  }

  const colGap = 0.28;
  const colW = (rect.w - colGap) / 2;
  const mid = Math.ceil(items.length / 2);
  const leftBullets = items.slice(0, mid).join("\n");
  const rightBullets = items.slice(mid).join("\n");

  textBlock({
    slide,
    rect: { x: rect.x, y: rect.y, w: colW, h: rect.h },
    text: leftBullets,
    fontSize: TYPOGRAPHY.footer,
    color: COLORS.text,
    lineSpacing: LINE_SPACING.relaxed,
    valign: "top",
    fit: "shrink"
  });

  if (rightBullets) {
    textBlock({
      slide,
      rect: { x: rect.x + colW + colGap, y: rect.y, w: colW, h: rect.h },
      text: rightBullets,
      fontSize: TYPOGRAPHY.footer,
      color: COLORS.text,
      lineSpacing: LINE_SPACING.relaxed,
      valign: "top",
      fit: "shrink"
    });
  }
}

export function renderFooterNote(slide: PptxGenJS.Slide, note: string): void {
  textBlock({
    slide,
    rect: footerNoteRect(),
    text: note,
    fontSize: TYPOGRAPHY.footer,
    color: COLORS.muted,
    lineSpacing: LINE_SPACING.relaxed,
    valign: "top",
    fit: "shrink"
  });
}
