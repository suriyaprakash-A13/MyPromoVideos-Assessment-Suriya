import { ACCENT_CYCLE, TYPOGRAPHY } from "@/lib/ppt/theme";
import { contentRectAboveFooter } from "@/lib/ppt/layout";
import { SlideBuilder, Rect } from "@/lib/ppt/types";
import { renderHeader, renderCard, renderFooterLabel, renderFooterNote } from "@/lib/ppt/components";

function recommendationCardRects(count: number): Rect[] {
  const base = contentRectAboveFooter();
  const cols = 3;
  const rows = 2;
  const gapX = 0.2;
  const gapY = 0.2;
  const colW = (base.w - gapX * (cols - 1)) / cols;
  const rowH = (base.h - gapY * (rows - 1)) / rows;

  return Array.from({ length: count }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      x: base.x + col * (colW + gapX),
      y: base.y + row * (rowH + gapY),
      w: colW,
      h: rowH
    };
  });
}

export const buildRecommendationsSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Video Marketing Recommendations", "Specific, actionable steps based on the data");

  const { slide } = ctx;
  const recs = vm.report.recommendations.slice(0, 6);
  const cardRects = recommendationCardRects(recs.length);

  recs.forEach((rec, index) => {
    renderCard(
      slide,
      cardRects[index],
      ACCENT_CYCLE[index] ?? ACCENT_CYCLE[0],
      `Recommendation ${index + 1}`,
      rec,
      TYPOGRAPHY.cardTitle,
      TYPOGRAPHY.bodySm
    );
  });

  renderFooterLabel(slide, "Execution order");
  renderFooterNote(
    slide,
    "1) Fix highest-opportunity gap  2) Publish strongest format consistently  3) Measure lift in views, engagement, cadence  4) Refresh mix quarterly"
  );
};
