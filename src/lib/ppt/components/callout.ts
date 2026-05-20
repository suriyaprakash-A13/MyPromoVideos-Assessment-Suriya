import PptxGenJS from "pptxgenjs";
import { COLORS, FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";
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

  textBlock({
    slide,
    rect: { x: rect.x + 0.22, y: rect.y + 0.15, w: rect.w - 0.32, h: 0.3 },
    text: title,
    fontFace: FONTS.display,
    fontSize: TYPOGRAPHY.sectionTitle,
    color: COLORS.white,
    bold: true,
    valign: "middle"
  });

  textBlock({
    slide,
    rect: { x: rect.x + 0.22, y: rect.y + 0.5, w: rect.w - 0.38, h: rect.h - 0.55 },
    text: bulletLines(body.split("\n"), maxLines),
    fontSize: TYPOGRAPHY.body,
    color: COLORS.muted,
    lineSpacing: 17,
    margin: [2, 0, 2, 0]
  });
}
