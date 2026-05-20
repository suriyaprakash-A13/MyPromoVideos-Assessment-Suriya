import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderMetricCard, panelRect, textBlock } from "@/lib/ppt/components";
import { fmtCompact, fmtPct } from "@/lib/ppt/format";
import { TYPOGRAPHY } from "@/lib/ppt/theme";

export const buildChannelSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Channel Overview Comparison", "Subscriber scale, total videos, and upload frequency");

  const { slide, pptx } = ctx;
  const nl = vm.normalizedLeaders;

  addThemedChart(
    slide,
    pptx,
    pptx.ChartType.bar,
    [
      {
        name: "Subscribers",
        labels: vm.companies,
        values: vm.report.companies.map((c) => c.subscribers ?? 0)
      },
      {
        name: "Total Videos",
        labels: vm.companies,
        values: vm.report.companies.map((c) => c.totalVideos ?? c.videos.length)
      }
    ],
    { x: MARGIN_X, y: 1.38, w: 8.15, h: 4.95 },
    { barDir: "col", catAxisLabelRotate: -25, showLegend: true, legendPos: "b" }
  );

  panelRect(slide, { x: 9.08, y: 1.38, w: 3.45, h: 4.95 }, COLORS.panel2);

  textBlock({
    slide,
    rect: { x: 9.32, y: 1.63, w: 2.2, h: 0.22 },
    text: "Upload frequency",
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted
  });

  const cadenceText = vm.channelMetrics
    .map((m) => `${m.company}: ${m.uploadsPerWeek.toFixed(2)}/wk | consistency ${fmtPct(m.consistency * 100, 0)}`)
    .join("\n");

  textBlock({
    slide,
    rect: { x: 9.32, y: 1.9, w: 2.9, h: 1.5 },
    text: cadenceText,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.text
  });

  renderMetricCard(
    slide,
    { x: 9.32, y: 3.48, w: 2.9, h: 0.9 },
    "Highest scale",
    nl.subscribers?.company ?? "n/a",
    `Subscribers: ${fmtCompact(nl.subscribers ? vm.scoreByCompany.get(nl.subscribers.company)?.normalized.subscribers : undefined)}`,
    COLORS.purple
  );
  renderMetricCard(
    slide,
    { x: 9.32, y: 4.47, w: 2.9, h: 0.9 },
    "Most active",
    nl.postingFrequency?.company ?? "n/a",
    `Videos per week: ${nl.postingFrequency ? vm.analysisByCompany.get(nl.postingFrequency.company)?.uploadsPerWeek.toFixed(2) : "n/a"}`,
    COLORS.green
  );
  renderMetricCard(
    slide,
    { x: 9.32, y: 5.46, w: 2.9, h: 0.9 },
    "Most consistent",
    nl.consistency?.company ?? "n/a",
    `Consistency: ${nl.consistency ? fmtPct((vm.scoreByCompany.get(nl.consistency.company)?.normalized.consistency ?? 0) * 100, 0) : "n/a"}`,
    COLORS.cyan
  );
};
