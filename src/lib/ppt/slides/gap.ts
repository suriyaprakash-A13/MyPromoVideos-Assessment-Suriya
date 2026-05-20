import { COLORS, FONTS, TYPOGRAPHY, LINE_SPACING } from "@/lib/ppt/theme";
import { contentRectAboveFooter, insetRect } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, panelRect, textBlock, renderFooterNote } from "@/lib/ppt/components";
import { maxCharsForWidth, truncateText } from "@/lib/ppt/format";

export const buildGapSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Gap Analysis", "Topics and formats competitors are not covering");

  const { slide } = ctx;
  const gapHighlights = vm.report.gaps.slice(0, 6);
  const main = contentRectAboveFooter();
  const pad = insetRect(main, 0.22);

  panelRect(slide, main, COLORS.panel, COLORS.lineSoft);

  const sectionHeaderH = 0.3;
  const gridGap = 0.14;
  const cols = 2;
  const rows = 3;
  const colW = (pad.w - gridGap) / cols;
  const rowH = (pad.h - sectionHeaderH - gridGap * (rows - 1)) / rows;
  const maxChars = maxCharsForWidth(colW - 0.7, 11);

  textBlock({
    slide,
    rect: { x: pad.x, y: pad.y, w: pad.w, h: sectionHeaderH },
    text: "Priority opportunities",
    fontSize: TYPOGRAPHY.bodyMd,
    color: COLORS.muted,
    bold: true,
    valign: "middle"
  });

  gapHighlights.forEach((gap, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const card = {
      x: pad.x + col * (colW + gridGap),
      y: pad.y + sectionHeaderH + row * (rowH + gridGap),
      w: colW,
      h: rowH
    };

    panelRect(slide, card);

    textBlock({
      slide,
      rect: { x: card.x + 0.12, y: card.y + 0.1, w: 0.36, h: 0.28 },
      text: `${index + 1}`,
      fontSize: TYPOGRAPHY.bodyMd,
      color: COLORS.magenta,
      bold: true,
      align: "center",
      valign: "middle"
    });

    textBlock({
      slide,
      rect: { x: card.x + 0.52, y: card.y + 0.1, w: card.w - 0.64, h: card.h - 0.2 },
      text: truncateText(gap, maxChars),
      fontFace: FONTS.body,
      fontSize: TYPOGRAPHY.bodyMd,
      color: COLORS.ink,
      bold: true,
      valign: "top",
      lineSpacing: LINE_SPACING.relaxed,
      fit: "shrink"
    });
  });

  renderFooterNote(
    slide,
    "Strongest opportunities: areas where competitors are least active across category depth, cadence, and audience interaction."
  );
};
