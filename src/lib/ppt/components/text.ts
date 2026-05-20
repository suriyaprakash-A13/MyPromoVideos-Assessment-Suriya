import PptxGenJS from "pptxgenjs";
import { COLORS, FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";
import { Rect } from "@/lib/ppt/types";

export interface TextBlockOptions {
  slide: PptxGenJS.Slide;
  rect: Rect;
  text: string;
  fontSize?: number;
  fontFace?: string;
  color?: string;
  bold?: boolean;
  align?: PptxGenJS.HAlign;
  valign?: PptxGenJS.VAlign;
  lineSpacing?: number;
  margin?: number | [number, number, number, number];
  fit?: "none" | "shrink" | "resize";
}

export function textBlock(options: TextBlockOptions): void {
  const {
    slide,
    rect,
    text,
    fontSize = TYPOGRAPHY.bodyMd,
    fontFace = FONTS.body,
    color = COLORS.text,
    bold = false,
    align,
    valign = "top",
    lineSpacing,
    margin = 0,
    fit = "shrink"
  } = options;

  slide.addText(text, {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    fontFace,
    fontSize,
    color,
    bold,
    align,
    valign,
    lineSpacing,
    margin,
    fit
  });
}
