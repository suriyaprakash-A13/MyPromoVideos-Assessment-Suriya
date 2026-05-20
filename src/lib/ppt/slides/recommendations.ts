import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, renderCard, renderFooterNote } from "@/lib/ppt/components";

const ACCENTS = [COLORS.purple, COLORS.cyan, COLORS.gold, COLORS.green, COLORS.violet, COLORS.red];

export const buildRecommendationsSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Video Marketing Recommendations", "Specific, actionable steps based on the data");

  const { slide } = ctx;

  vm.report.recommendations.slice(0, 6).forEach((rec, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = MARGIN_X + column * 4.07;
    const y = 1.48 + row * 2.22;

    renderCard(
      slide,
      { x, y, w: 3.72, h: 1.86 },
      ACCENTS[index] ?? COLORS.purple,
      `Recommendation ${index + 1}`,
      rec,
      10.5,
      8.5
    );
  });

  renderFooterNote(
    slide,
    "Execution order: 1) Fix highest-opportunity gap  2) Publish strongest format consistently  3) Measure lift in views, engagement, cadence  4) Refresh mix quarterly"
  );
};
