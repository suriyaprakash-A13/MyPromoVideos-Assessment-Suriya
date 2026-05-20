import { ACCENT_CYCLE } from "@/lib/ppt/theme";
import { chartWithSidebarLayout, stackRects } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderMetricCard, renderFooterLabel, renderFooterBullets } from "@/lib/ppt/components";
import { fmtCompact, fmtPct } from "@/lib/ppt/format";

export const buildEngagementSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Engagement Analysis", "Average views, likes, and comments per video");

  const { slide, pptx } = ctx;
  const nl = vm.normalizedLeaders;
  const { chart, sidebar } = chartWithSidebarLayout(true);

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
    chart,
    { barDir: "col", showLegend: true, legendPos: "b", catAxisLabelFontSize: 10, valAxisLabelFontSize: 10 }
  );

  const cards = stackRects(3, sidebar, 0.14);

  renderMetricCard(
    slide,
    cards[0],
    "Best reach",
    nl.avgViews?.company ?? "n/a",
    `Avg views: ${nl.avgViews ? fmtCompact(vm.analysisByCompany.get(nl.avgViews.company)?.avgViews) : "n/a"}`,
    ACCENT_CYCLE[0]
  );
  renderMetricCard(
    slide,
    cards[1],
    "Best response",
    nl.engagementRate?.company ?? "n/a",
    `Engagement: ${nl.engagementRate ? fmtPct(vm.analysisByCompany.get(nl.engagementRate.company)?.engagementRate, 2) : "n/a"}`,
    ACCENT_CYCLE[1]
  );
  renderMetricCard(
    slide,
    cards[2],
    "Efficiency",
    "Reach vs response",
    "High views alone do not guarantee stronger interaction; balance both.",
    ACCENT_CYCLE[2]
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
