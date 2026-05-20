import { CHART_SERIES, ACCENT_CYCLE } from "@/lib/ppt/theme";
import { chartWithSidebarLayout, stackRects } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderMetricCard, renderFooterLabel, renderFooterNote } from "@/lib/ppt/components";
import { formatTrendChange } from "@/lib/trendVelocity";
import { truncateText } from "@/lib/ppt/format";

export const buildRankingSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Summary Ranking", "Score all companies on the key metrics used in the model");

  const { slide, pptx } = ctx;
  const nl = vm.normalizedLeaders;
  const { chart, sidebar } = chartWithSidebarLayout(true);

  addThemedChart(
    slide,
    pptx,
    pptx.ChartType.bar,
    [
      {
        name: "Weighted score",
        labels: vm.scoresRanked.map((s) => s.company),
        values: vm.scoresRanked.map((s) => s.score)
      }
    ],
    chart,
    { barDir: "bar", showLegend: false, chartColors: [...CHART_SERIES] }
  );

  const medals = [
    { label: "1st place", accent: ACCENT_CYCLE[0], index: 0 },
    { label: "2nd place", accent: ACCENT_CYCLE[1], index: 1 },
    { label: "3rd place", accent: ACCENT_CYCLE[2], index: 2 },
    {
      label: "Biggest factor",
      accent: ACCENT_CYCLE[3],
      index: -1,
      value: truncateText(nl.avgViews?.company ?? "n/a", 16),
      detail: "Reach drives score when cadence is close."
    }
  ];

  const sidebarCards = stackRects(4, sidebar, 0.12);

  medals.forEach((medal, i) => {
    if (medal.index >= 0) {
      const entry = vm.scoresRanked[medal.index];
      const trendSuffix = entry?.trend ? ` ${formatTrendChange(entry.trend.direction, entry.trend.changePct)}` : "";
      renderMetricCard(
        slide,
        sidebarCards[i],
        medal.label,
        truncateText(entry?.company ?? "n/a", 14),
        `Score: ${entry ? entry.score.toFixed(1) : "n/a"}${trendSuffix}`,
        medal.accent
      );
      return;
    }

    renderMetricCard(slide, sidebarCards[i], medal.label, medal.value!, medal.detail!, medal.accent);
  });

  renderFooterLabel(slide, "Scoring methodology");
  renderFooterNote(slide, vm.report.rankingMethod);
};
