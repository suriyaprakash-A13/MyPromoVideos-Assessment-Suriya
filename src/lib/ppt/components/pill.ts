import PptxGenJS from "pptxgenjs";
import { COLORS, TYPOGRAPHY } from "@/lib/ppt/theme";
import { textBlock } from "@/lib/ppt/components/text";

export function renderPill(
  slide: PptxGenJS.Slide,
  x: number,
  y: number,
  label: string,
  fill: string,
  textColor: string = COLORS.white
): number {
  const width = Math.max(0.95, Math.min(2.6, label.length * 0.095 + 0.42));

  slide.addShape("roundRect", {
    x,
    y,
    w: width,
    h: 0.32,
    fill: { color: fill },
    line: { color: fill, pt: 0.8 }
  });

  textBlock({
    slide,
    rect: { x, y: y + 0.03, w: width, h: 0.22 },
    text: label,
    fontSize: TYPOGRAPHY.pill,
    color: textColor,
    bold: true,
    align: "center",
    valign: "middle"
  });

  return width;
}
