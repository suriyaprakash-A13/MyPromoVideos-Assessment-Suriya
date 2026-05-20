import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderCard, textBlock } from "@/lib/ppt/components";
import { fmtCompact, fmtPct, truncateText, videoEngagement } from "@/lib/ppt/format";
import { TYPOGRAPHY } from "@/lib/ppt/theme";

export const buildTopViewsSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Content Performance - Top Videos by Views", "Which videos are pulling the biggest audience");

  const { slide, pptx } = ctx;
  const gap = 0.12;

  addThemedChart(
    slide,
    pptx,
    pptx.ChartType.bar,
    [
      {
        name: "Top video views",
        labels: vm.topVideoByViews.map((item) => item.company),
        values: vm.topVideoByViews.map((item) => item.top?.views ?? 0)
      }
    ],
    { x: MARGIN_X, y: 1.38, w: 12.0, h: 1.95 },
    { barDir: "col", showLegend: false, catAxisLabelRotate: -18 }
  );

  textBlock({
    slide,
    rect: { x: MARGIN_X + 0.02, y: 3.45, w: 3.2, h: 0.18 },
    text: "Per-company breakout",
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted
  });

  vm.topVideoByViews.forEach((item, index) => {
    const x = MARGIN_X + index * (vm.cardWidth + gap);
    const top = item.top;
    const runnerUp = item.runnerUp;
    const body = [
      `Top viewed: ${truncateText(top?.title ?? "n/a", vm.titleChars)}`,
      `Views: ${fmtCompact(top?.views)} | ER: ${fmtPct(videoEngagement(top ?? { title: "", url: "" }), 2)}`,
      `Runner-up: ${truncateText(runnerUp?.title ?? "n/a", vm.bodyChars)}`,
      `Views: ${fmtCompact(runnerUp?.views)} | ER: ${fmtPct(videoEngagement(runnerUp ?? { title: "", url: "" }), 2)}`
    ].join("\n");

    renderCard(slide, { x, y: 3.72, w: vm.cardWidth, h: 2.85 }, COLORS.purple, item.company, body, 10.5, 8.7);
  });
};
