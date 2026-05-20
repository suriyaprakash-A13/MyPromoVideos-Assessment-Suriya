import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderCard, textBlock } from "@/lib/ppt/components";
import { fmtCompact, fmtPct, truncateText, videoEngagement } from "@/lib/ppt/format";
import { TYPOGRAPHY } from "@/lib/ppt/theme";

export const buildTopEngagementSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Content Performance - Top Videos by Engagement", "Which videos trigger the strongest audience response");

  const { slide, pptx } = ctx;
  const gap = 0.12;
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

  vm.topVideoByEngagement.forEach((item, index) => {
    const x = MARGIN_X + index * (vm.cardWidth + gap);
    const top = item.top;
    const er = videoEngagement(top ?? { title: "", url: "" });
    const body = [
      `Best engagement: ${truncateText(top?.title ?? "n/a", vm.titleChars)}`,
      `ER: ${fmtPct(er, 2)} | Views: ${fmtCompact(top?.views)}`,
      `${er >= median ? "Above" : "Below"} peer median engagement`,
      `Channel avg ER: ${item.analysis ? fmtPct(item.analysis.engagementRate, 2) : "n/a"}`
    ].join("\n");

    renderCard(slide, { x, y: 3.72, w: vm.cardWidth, h: 2.85 }, COLORS.green, item.company, body, 10.5, 8.7);
  });
};
