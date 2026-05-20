import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X, CONTENT_BOTTOM } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderMetricCard, textBlock } from "@/lib/ppt/components";
import { TYPOGRAPHY } from "@/lib/ppt/theme";

export const buildRankingSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Summary Ranking", "Score all companies on the key metrics used in the model");

  const { slide, pptx } = ctx;
  const nl = vm.normalizedLeaders;

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
    { x: MARGIN_X, y: 1.38, w: 8.2, h: 4.95 },
    { barDir: "bar", showLegend: false, chartColors: [COLORS.purple, COLORS.cyan, COLORS.green, COLORS.gold, COLORS.violet] }
  );

  const medals = [
    { label: "1st place", accent: COLORS.purple, index: 0 },
    { label: "2nd place", accent: COLORS.cyan, index: 1 },
    { label: "3rd place", accent: COLORS.gold, index: 2 }
  ];

  medals.forEach((medal, i) => {
    renderMetricCard(
      slide,
      { x: 9.12, y: 1.42 + i * 1.0, w: 3.42, h: 0.88 },
      medal.label,
      vm.scoresRanked[medal.index]?.company ?? "n/a",
      `Score: ${vm.scoresRanked[medal.index] ? vm.scoresRanked[medal.index].score.toFixed(1) : "n/a"}`,
      medal.accent
    );
  });

  renderMetricCard(
    slide,
    { x: 9.12, y: 4.42, w: 3.42, h: 0.88 },
    "Biggest factor",
    nl.avgViews?.company ?? "n/a",
    "Reach often drives the overall score when quality and cadence are close.",
    COLORS.green
  );

  textBlock({
    slide,
    rect: { x: MARGIN_X, y: CONTENT_BOTTOM + 0.13, w: 12.0, h: 0.52 },
    text: vm.report.rankingMethod,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted
  });
};
