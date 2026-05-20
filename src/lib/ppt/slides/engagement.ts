import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderMetricCard, renderFooterLabel, renderFooterBullets } from "@/lib/ppt/components";
import { fmtCompact, fmtPct } from "@/lib/ppt/format";

export const buildEngagementSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Engagement Analysis", "Average views, likes, and comments per video");

  const { slide, pptx } = ctx;
  const nl = vm.normalizedLeaders;

  addThemedChart(
    slide,
    pptx,
    pptx.ChartType.bar,
    [
      {
        name: "Avg Views",
        labels: vm.report.analysis.map((a) => a.company),
        values: vm.report.analysis.map((a) => Math.round(a.avgViews))
      },
      {
        name: "Avg Likes",
        labels: vm.report.analysis.map((a) => a.company),
        values: vm.report.analysis.map((a) => Math.round(a.avgLikes))
      },
      {
        name: "Avg Comments",
        labels: vm.report.analysis.map((a) => a.company),
        values: vm.report.analysis.map((a) => Math.round(a.avgComments))
      }
    ],
    { x: MARGIN_X, y: 1.38, w: 8.2, h: 4.95 },
    { barDir: "col", showLegend: true, legendPos: "b" }
  );

  renderMetricCard(
    slide,
    { x: 9.12, y: 1.42, w: 3.42, h: 0.9 },
    "Best reach",
    nl.avgViews?.company ?? "n/a",
    `Average views: ${nl.avgViews ? fmtCompact(vm.analysisByCompany.get(nl.avgViews.company)?.avgViews) : "n/a"}`,
    COLORS.purple
  );
  renderMetricCard(
    slide,
    { x: 9.12, y: 2.42, w: 3.42, h: 0.9 },
    "Best response",
    nl.engagementRate?.company ?? "n/a",
    `Avg engagement: ${nl.engagementRate ? fmtPct(vm.analysisByCompany.get(nl.engagementRate.company)?.engagementRate, 2) : "n/a"}`,
    COLORS.green
  );
  renderMetricCard(
    slide,
    { x: 9.12, y: 3.42, w: 3.42, h: 0.9 },
    "Most comments",
    nl.contentDiversity?.company ?? "n/a",
    "Conversation improves when topics are broader and formats vary.",
    COLORS.cyan
  );
  renderMetricCard(
    slide,
    { x: 9.12, y: 4.42, w: 3.42, h: 0.9 },
    "Reading the gap",
    "Efficiency beats raw reach",
    "High volume does not guarantee stronger interaction; balance matters.",
    COLORS.gold
  );

  renderFooterLabel(slide, "Per-company engagement summary");
  renderFooterBullets(
    slide,
    vm.report.analysis.map(
      (a) =>
        `${a.company}: ${fmtCompact(a.avgViews)} views, ${fmtCompact(a.avgLikes)} likes, ${fmtCompact(a.avgComments)} comments, ER ${fmtPct(a.engagementRate, 2)}`
    )
  );
};
