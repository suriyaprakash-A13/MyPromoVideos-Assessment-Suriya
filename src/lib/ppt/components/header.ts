import { COLORS, BRAND, FONTS, TYPOGRAPHY, TOTAL_SLIDES } from "@/lib/ppt/theme";
import { SLIDE_W, MARGIN_X, HEADER_RULE_Y, FOOTER_Y } from "@/lib/ppt/layout";
import { SlideContext } from "@/lib/ppt/types";
import { textBlock } from "@/lib/ppt/components/text";

export function renderHeader(ctx: SlideContext, title: string, subtitle: string): void {
  const { slide } = ctx;

  slide.background = { color: COLORS.bg };

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: 0.32,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.bg2, pt: 0 }
  });

  textBlock({
    slide,
    rect: { x: MARGIN_X, y: 0.34, w: 11.3, h: 0.38 },
    text: title,
    fontFace: FONTS.display,
    fontSize: TYPOGRAPHY.slideTitle,
    color: COLORS.white,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: MARGIN_X + 0.02, y: 0.7, w: 11.7, h: 0.28 },
    text: subtitle,
    fontSize: TYPOGRAPHY.bodySm,
    color: COLORS.muted,
    valign: "middle",
    fit: "shrink"
  });

  slide.addShape("line", {
    x: MARGIN_X,
    y: HEADER_RULE_Y,
    w: SLIDE_W - MARGIN_X * 2,
    h: 0,
    line: { color: COLORS.line, pt: 1 }
  });

  textBlock({
    slide,
    rect: { x: 12.1, y: FOOTER_Y, w: 0.9, h: 0.18 },
    text: `Page ${ctx.page} / ${TOTAL_SLIDES}`,
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.muted,
    align: "right",
    valign: "middle"
  });

  textBlock({
    slide,
    rect: { x: MARGIN_X, y: FOOTER_Y, w: 3.5, h: 0.18 },
    text: BRAND.name,
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.muted,
    valign: "middle"
  });
}

export function renderCoverBackground(ctx: SlideContext): void {
  const { slide } = ctx;
  slide.background = { color: COLORS.bg };

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: 0.42,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.bg2, pt: 0 }
  });
}
