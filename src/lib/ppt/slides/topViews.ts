import { ACCENT_CYCLE } from "@/lib/ppt/theme";
import { chartWithCardsBelow, rowOfRects } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderCard, renderSectionLabel } from "@/lib/ppt/components";
import { fmtCompact, fmtPct, truncateText, videoEngagement } from "@/lib/ppt/format";

export const buildTopViewsSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Content Performance - Top Videos by Views", "Which videos are pulling the biggest audience");

  const { slide, pptx } = ctx;
  const { chart, cardsY, cardsH } = chartWithCardsBelow(2.15);
  const cardRects = rowOfRects(vm.topVideoByViews.length, cardsY, cardsH);

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
    chart,
    { barDir: "col", showLegend: false, catAxisLabelRotate: -18 }
  );

  renderSectionLabel(slide, "Per-company breakout", cardsY - 0.22);

  vm.topVideoByViews.forEach((item, index) => {
    const top = item.top;
    const runnerUp = item.runnerUp;
    const body = [
      `Top viewed: ${truncateText(top?.title ?? "n/a", vm.titleChars)}`,
      `Views: ${fmtCompact(top?.views)} | ER: ${fmtPct(videoEngagement(top ?? { title: "", url: "" }), 2)}`,
      `Runner-up: ${truncateText(runnerUp?.title ?? "n/a", vm.bodyChars)}`,
      `Views: ${fmtCompact(runnerUp?.views)} | ER: ${fmtPct(videoEngagement(runnerUp ?? { title: "", url: "" }), 2)}`
    ].join("\n");

    renderCard(slide, cardRects[index], ACCENT_CYCLE[index % ACCENT_CYCLE.length], item.company, body);
  });
};
