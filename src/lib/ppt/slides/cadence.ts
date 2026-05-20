import { ACCENT_CYCLE } from "@/lib/ppt/theme";
import { chartWithSidebarLayout, stackRects } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderCallout, renderFooterLabel, renderFooterBullets } from "@/lib/ppt/components";
import { fmtPct } from "@/lib/ppt/format";

export const buildCadenceSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Posting Frequency and Consistency", "Who is most active and who keeps cadence stable");

  const { slide, pptx } = ctx;
  const nl = vm.normalizedLeaders;
  const { chart, sidebar } = chartWithSidebarLayout(true);

  addThemedChart(
    slide,
    pptx,
    pptx.ChartType.bar,
    [
      {
        name: "Videos per week",
        labels: vm.report.analysis.map((a) => a.company),
        values: vm.report.analysis.map((a) => Number(a.uploadsPerWeek.toFixed(2)))
      },
      {
        name: "Consistency score",
        labels: vm.report.analysis.map((a) => a.company),
        values: vm.report.analysis.map((a) => Number((a.consistencyScore * 100).toFixed(2)))
      }
    ],
    chart,
    { barDir: "col", showLegend: true, legendPos: "b" }
  );

  const callouts = stackRects(3, sidebar, 0.14);

  renderCallout(
    slide,
    callouts[0],
    "Cadence leader",
    `${nl.postingFrequency?.company ?? "n/a"} is the most active on a normalized basis and sets the tempo for the set.`,
    ACCENT_CYCLE[0],
    3
  );
  renderCallout(
    slide,
    callouts[1],
    "Consistency leader",
    `${nl.consistency?.company ?? "n/a"} keeps a steadier publishing pattern and reduces volatility in output.`,
    ACCENT_CYCLE[1],
    3
  );
  renderCallout(
    slide,
    callouts[2],
    "Strategic read",
    "The best program combines frequent publishing with a repeatable cadence, not just burst volume.",
    ACCENT_CYCLE[2],
    3
  );

  renderFooterLabel(slide, "Cadence ranking");
  renderFooterBullets(
    slide,
    vm.report.analysis
      .slice()
      .sort((a, b) => b.uploadsPerWeek - a.uploadsPerWeek)
      .map((a) => `${a.company}: ${a.uploadsPerWeek.toFixed(2)}/week, consistency ${fmtPct(a.consistencyScore * 100, 0)}`)
  );
};
