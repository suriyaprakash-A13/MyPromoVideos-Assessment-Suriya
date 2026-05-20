import PptxGenJS from "pptxgenjs";
import { COLORS } from "@/lib/ppt/theme";
import { Rect } from "@/lib/ppt/types";

export function panelRect(
  slide: PptxGenJS.Slide,
  rect: Rect,
  fill: string = COLORS.panel,
  line: string = COLORS.line
): void {
  slide.addShape("roundRect", {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    fill: { color: fill },
    line: { color: line, pt: 1 }
  });
}

export function accentBar(slide: PptxGenJS.Slide, rect: Rect, accent: string): void {
  slide.addShape("roundRect", {
    x: rect.x,
    y: rect.y,
    w: 0.08,
    h: rect.h,
    fill: { color: accent },
    rectRadius: 0
  });
}
