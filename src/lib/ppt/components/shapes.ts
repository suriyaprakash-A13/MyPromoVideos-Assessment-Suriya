import PptxGenJS from "pptxgenjs";
import { COLORS, PANEL_RADIUS, ACCENT_BAR_W } from "@/lib/ppt/theme";
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
    line: { color: line, pt: 0.75 },
    rectRadius: PANEL_RADIUS
  });
}

export function accentBar(slide: PptxGenJS.Slide, rect: Rect, accent: string): void {
  const inset = 0.1;
  slide.addShape("roundRect", {
    x: rect.x,
    y: rect.y + inset,
    w: ACCENT_BAR_W,
    h: Math.max(0.2, rect.h - inset * 2),
    fill: { color: accent },
    rectRadius: 0.02
  });
}
