import PptxGenJS from "pptxgenjs";
import { COLORS, TYPOGRAPHY, PANEL_RADIUS } from "@/lib/ppt/theme";
import { textBlock } from "@/lib/ppt/components/text";

export function renderPill(
  slide: PptxGenJS.Slide,
  x: number,
  y: number,
  label: string,
  fill: string,
  textColor: string = COLORS.ink
): number {
  const width = Math.max(1.0, Math.min(2.4, label.length * 0.088 + 0.5));
  const height = 0.34;

  slide.addShape("roundRect", {
    x,
    y,
    w: width,
    h: height,
    fill: { color: fill },
    line: { color: fill, pt: 0.5 },
    rectRadius: PANEL_RADIUS
  });

  textBlock({
    slide,
    rect: { x, y: y + 0.06, w: width, h: height - 0.08 },
    text: label,
    fontSize: TYPOGRAPHY.pill,
    color: textColor,
    bold: true,
    align: "center",
    valign: "middle"
  });

  return width;
}
