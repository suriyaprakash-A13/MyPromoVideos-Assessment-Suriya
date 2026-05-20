import { COLORS, FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, panelRect, textBlock, renderFooterNote } from "@/lib/ppt/components";

export const buildGapSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Gap Analysis", "Topics and formats competitors are not covering");

  const { slide } = ctx;
  const gapHighlights = vm.report.gaps.slice(0, 6);

  panelRect(slide, { x: MARGIN_X, y: 1.38, w: 12.0, h: 4.95 }, COLORS.panel2);

  textBlock({
    slide,
    rect: { x: 0.98, y: 1.62, w: 2.4, h: 0.2 },
    text: "Priority opportunities",
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted
  });

  gapHighlights.forEach((gap, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = 0.98 + col * 5.85;
    const y = 1.92 + row * 1.58;

    panelRect(slide, { x, y, w: 5.42, h: 1.4 });

    textBlock({
      slide,
      rect: { x: x + 0.12, y: y + 0.19, w: 0.48, h: 0.16 },
      text: `${index + 1}`,
      fontSize: TYPOGRAPHY.footnote,
      color: COLORS.text,
      bold: true,
      align: "center"
    });

    textBlock({
      slide,
      rect: { x: x + 0.72, y: y + 0.1, w: 4.45, h: 0.9 },
      text: gap,
      fontFace: FONTS.display,
      fontSize: TYPOGRAPHY.bodySm,
      color: COLORS.white,
      bold: true
    });
  });

  textBlock({
    slide,
    rect: { x: 0.98, y: 5.6, w: 3.0, h: 0.2 },
    text: "What the set is missing overall",
    fontSize: TYPOGRAPHY.body,
    color: COLORS.muted
  });

  textBlock({
    slide,
    rect: { x: 0.98, y: 5.85, w: 11.1, h: 0.5 },
    text: vm.report.gaps.slice(0, 4).map((g, i) => `${i + 1}. ${g}`).join("\n"),
    fontSize: TYPOGRAPHY.bodySm,
    color: COLORS.text
  });

  renderFooterNote(
    slide,
    "The strongest opportunities are where competitors are least active across category depth, cadence, and audience interaction."
  );
};
