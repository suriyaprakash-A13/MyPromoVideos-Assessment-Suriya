import { COLORS, TYPOGRAPHY, ACCENT_CYCLE } from "@/lib/ppt/theme";
import { chartWithSidebarLayout, stackRects, insetRect } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderMetricCard, panelRect, textBlock } from "@/lib/ppt/components";
import { fmtCompact, fmtPct } from "@/lib/ppt/format";

export const buildChannelSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Channel Overview Comparison", "Subscriber scale, total videos, and upload frequency");

  const { slide, pptx } = ctx;
  const nl = vm.normalizedLeaders;
  const { chart, sidebar } = chartWithSidebarLayout();

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
    chart,
    { barDir: "col", catAxisLabelRotate: -25, showLegend: true, legendPos: "b" }
  );

  panelRect(slide, sidebar, COLORS.panel, COLORS.lineSoft);
  const sidePad = insetRect(sidebar, 0.24);

  textBlock({
    slide,
    rect: { x: sidePad.x, y: sidePad.y, w: sidePad.w, h: 0.24 },
    text: "Upload frequency",
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted,
    bold: true,
    valign: "middle"
  });

  const cadenceText = vm.channelMetrics
    .map((m) => `${m.company}: ${m.uploadsPerWeek.toFixed(2)}/wk | consistency ${fmtPct(m.consistency * 100, 0)}`)
    .join("\n");

  textBlock({
    slide,
    rect: { x: sidePad.x, y: sidePad.y + 0.32, w: sidePad.w, h: 1.45 },
    text: cadenceText,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.text
  });

  const cards = stackRects(3, { x: sidePad.x, y: sidePad.y + 1.85, w: sidePad.w, h: sidePad.h - 1.85 }, 0.12);

  renderMetricCard(
    slide,
    cards[0],
    "Highest scale",
    nl.subscribers?.company ?? "n/a",
    `Subscribers: ${fmtCompact(nl.subscribers ? vm.scoreByCompany.get(nl.subscribers.company)?.normalized.subscribers : undefined)}`,
    ACCENT_CYCLE[0]
  );
  renderMetricCard(
    slide,
    cards[1],
    "Most active",
    nl.postingFrequency?.company ?? "n/a",
    `Videos per week: ${nl.postingFrequency ? vm.analysisByCompany.get(nl.postingFrequency.company)?.uploadsPerWeek.toFixed(2) : "n/a"}`,
    ACCENT_CYCLE[1]
  );
  renderMetricCard(
    slide,
    cards[2],
    "Most consistent",
    nl.consistency?.company ?? "n/a",
    `Consistency: ${nl.consistency ? fmtPct((vm.scoreByCompany.get(nl.consistency.company)?.normalized.consistency ?? 0) * 100, 0) : "n/a"}`,
    ACCENT_CYCLE[2]
  );
};
