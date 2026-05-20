import PptxGenJS from "pptxgenjs";
import { COLORS, FONTS, TYPOGRAPHY, LINE_SPACING, ACCENT_BAR_W } from "@/lib/ppt/theme";
import { Rect } from "@/lib/ppt/types";
import { panelRect, accentBar } from "@/lib/ppt/components/shapes";
import { textBlock } from "@/lib/ppt/components/text";
import { bulletLines } from "@/lib/ppt/format";

export function renderCallout(
  slide: PptxGenJS.Slide,
  rect: Rect,
  title: string,
  body: string,
  accent: string,
  maxLines = 8
): void {
  panelRect(slide, rect, COLORS.panel);
  accentBar(slide, rect, accent);

  const textX = rect.x + 0.22 + ACCENT_BAR_W + 0.08;
  const textW = rect.w - (textX - rect.x) - 0.18;
  const titleH = Math.min(0.42, rect.h * 0.22);
  const bodyY = rect.y + 0.16 + titleH + 0.1;
  const bodyH = Math.max(0.4, rect.y + rect.h - bodyY - 0.14);

  textBlock({
    slide,
    rect: { x: textX, y: rect.y + 0.16, w: textW, h: titleH },
    text: title,
    fontFace: FONTS.display,
    fontSize: TYPOGRAPHY.sectionTitle,
    color: COLORS.ink,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: textX, y: bodyY, w: textW, h: bodyH },
    text: bulletLines(body.split("\n"), maxLines),
    fontSize: TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    lineSpacing: LINE_SPACING.relaxed,
    valign: "top",
    margin: [5, 2, 5, 2],
    fit: "shrink"
  });
}
