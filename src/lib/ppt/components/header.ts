import { COLORS, BRAND, FONTS, TYPOGRAPHY, TOTAL_SLIDES, SLIDE_H, SLIDE_W } from "@/lib/ppt/theme";
import {
  MARGIN_X,
  HEADER_RULE_Y,
  FOOTER_Y,
  TITLE_Y,
  SUBTITLE_Y,
  HEADER_BAND_H
} from "@/lib/ppt/layout";
import { SlideContext } from "@/lib/ppt/types";
import { textBlock } from "@/lib/ppt/components/text";

export function renderSlideThemeBackground(slide: SlideContext["slide"]): void {
  slide.background = { color: COLORS.bg };

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.18,
    h: SLIDE_H,
    fill: { color: COLORS.teal, transparency: 92 },
    line: { color: COLORS.teal, transparency: 100, pt: 0 }
  });

  slide.addShape("rect", {
    x: SLIDE_W - 0.24,
    y: SLIDE_H - 1.8,
    w: 0.24,
    h: 1.8,
    fill: { color: COLORS.magenta, transparency: 90 },
    line: { color: COLORS.magenta, transparency: 100, pt: 0 }
  });

  slide.addShape("rect", {
    x: SLIDE_W - 3.0,
    y: SLIDE_H - 0.1,
    w: 3.0,
    h: 0.1,
    fill: { color: COLORS.pink },
    line: { color: COLORS.pink, pt: 0 }
  });
}

export function renderHeader(ctx: SlideContext, title: string, subtitle: string): void {
  const { slide } = ctx;

  renderSlideThemeBackground(slide);

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: HEADER_BAND_H,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.lineSoft, pt: 0.5 }
  });

  slide.addShape("rect", {
    x: 0,
    y: HEADER_BAND_H - 0.04,
    w: SLIDE_W * 0.55,
    h: 0.04,
    fill: { color: COLORS.teal },
    line: { color: COLORS.teal, pt: 0 }
  });

  slide.addShape("rect", {
    x: SLIDE_W * 0.55,
    y: HEADER_BAND_H - 0.04,
    w: SLIDE_W * 0.45,
    h: 0.04,
    fill: { color: COLORS.magenta },
    line: { color: COLORS.magenta, pt: 0 }
  });

  textBlock({
    slide,
    rect: { x: MARGIN_X, y: TITLE_Y, w: 10.5, h: 0.36 },
    text: title,
    fontFace: FONTS.display,
    fontSize: TYPOGRAPHY.slideTitle,
    color: COLORS.ink,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: MARGIN_X, y: SUBTITLE_Y, w: 11.2, h: 0.24 },
    text: subtitle,
    fontSize: TYPOGRAPHY.slideSubtitle,
    color: COLORS.muted,
    valign: "middle",
    fit: "shrink"
  });

  slide.addShape("line", {
    x: MARGIN_X,
    y: HEADER_RULE_Y,
    w: SLIDE_W - MARGIN_X * 2,
    h: 0,
    line: { color: COLORS.lineSoft, pt: 1 }
  });

  slide.addShape("roundRect", {
    x: SLIDE_W - MARGIN_X - 1.05,
    y: FOOTER_Y - 0.02,
    w: 1.05,
    h: 0.22,
    fill: { color: COLORS.magenta },
    line: { color: COLORS.magenta, pt: 0.5 }
  });

  textBlock({
    slide,
    rect: { x: SLIDE_W - MARGIN_X - 1.0, y: FOOTER_Y, w: 0.95, h: 0.18 },
    text: `${ctx.page} / ${TOTAL_SLIDES}`,
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.onAccent,
    align: "center",
    valign: "middle"
  });

  textBlock({
    slide,
    rect: { x: MARGIN_X, y: FOOTER_Y, w: 4.2, h: 0.18 },
    text: BRAND.name,
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.muted,
    valign: "middle"
  });
}

export function renderCoverBackground(ctx: SlideContext): void {
  const { slide } = ctx;
  renderSlideThemeBackground(slide);

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: 0.44,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.lineSoft, pt: 0.5 }
  });

  slide.addShape("rect", {
    x: 0,
    y: 0.44,
    w: SLIDE_W * 0.5,
    h: 0.03,
    fill: { color: COLORS.teal },
    line: { color: COLORS.teal, pt: 0 }
  });

  slide.addShape("rect", {
    x: SLIDE_W * 0.5,
    y: 0.44,
    w: SLIDE_W * 0.5,
    h: 0.03,
    fill: { color: COLORS.magenta },
    line: { color: COLORS.magenta, pt: 0 }
  });
}
