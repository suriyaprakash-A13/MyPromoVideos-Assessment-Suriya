import { ACCENT_CYCLE } from "@/lib/ppt/theme";
import { chartWithCardsBelow, rowOfRects } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderCard, renderSectionLabel } from "@/lib/ppt/components";
import { fmtCompact, fmtPct, truncateText, videoEngagement } from "@/lib/ppt/format";

export const buildTopEngagementSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Content Performance - Top Videos by Engagement", "Which videos trigger the strongest audience response");

  const { slide, pptx } = ctx;
  const { chart, cardsY, cardsH } = chartWithCardsBelow(2.15);
  const cardRects = rowOfRects(vm.topVideoByEngagement.length, cardsY, cardsH);
  const median =
    [...vm.report.analysis].sort((a, b) => a.engagementRate - b.engagementRate)[Math.floor(vm.report.analysis.length / 2)]
      ?.engagementRate ?? 0;

  addThemedChart(
    slide,
    pptx,
    pptx.ChartType.bar,
    [
      {
        name: "Top engagement (%)",
        labels: vm.topVideoByEngagement.map((item) => item.company),
        values: vm.topVideoByEngagement.map((item) => videoEngagement(item.top ?? { title: "", url: "" }))
      }
    ],
    chart,
    { barDir: "col", showLegend: false, catAxisLabelRotate: -18 }
  );

  renderSectionLabel(slide, "Per-company breakout", cardsY - 0.22);

  vm.topVideoByEngagement.forEach((item, index) => {
    const top = item.top;
    const er = videoEngagement(top ?? { title: "", url: "" });
    const body = [
      `Best engagement: ${truncateText(top?.title ?? "n/a", vm.titleChars)}`,
      `ER: ${fmtPct(er, 2)} | Views: ${fmtCompact(top?.views)}`,
      `${er >= median ? "Above" : "Below"} peer median engagement`,
      `Channel avg ER: ${item.analysis ? fmtPct(item.analysis.engagementRate, 2) : "n/a"}`
    ].join("\n");

    renderCard(slide, cardRects[index], ACCENT_CYCLE[(index + 1) % ACCENT_CYCLE.length], item.company, body);
  });
};
