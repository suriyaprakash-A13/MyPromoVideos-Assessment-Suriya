import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, renderCallout, renderMetricCard, panelRect, textBlock } from "@/lib/ppt/components";
import { FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";

export const buildExecutiveSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Executive Summary", "Who leads in video marketing and why");

  const { slide } = ctx;
  const leader = vm.scoresRanked[0];
  const runnerUp = vm.scoresRanked[1];
  const nl = vm.normalizedLeaders;

  panelRect(slide, { x: MARGIN_X, y: 1.32, w: 4.25, h: 4.95 }, COLORS.panel2);

  textBlock({
    slide,
    rect: { x: 0.96, y: 1.58, w: 2.2, h: 0.2 },
    text: "Overall leader",
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted
  });

  textBlock({
    slide,
    rect: { x: 0.96, y: 1.85, w: 3.3, h: 0.42 },
    text: leader?.company ?? "n/a",
    fontFace: FONTS.display,
    fontSize: TYPOGRAPHY.metricValue,
    color: COLORS.white,
    bold: true
  });

  textBlock({
    slide,
    rect: { x: 0.96, y: 2.35, w: 2.8, h: 0.2 },
    text: `Weighted score ${leader ? leader.score.toFixed(1) : "n/a"}`,
    fontSize: TYPOGRAPHY.bodySm,
    color: COLORS.cyan
  });

  textBlock({
    slide,
    rect: { x: 0.96, y: 2.72, w: 3.45, h: 1.25 },
    text: [
      "• Leader advantage comes from scale, cadence, and consistency.",
      "• Runner-up pressure is strongest where reach is high but cadence trails.",
      "• Biggest opportunity: convert topic breadth into repeatable engagement."
    ].join("\n"),
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.text
  });

  renderMetricCard(
    slide,
    { x: 0.95, y: 4.25, w: 1.2, h: 1.2 },
    "Gap",
    runnerUp && leader ? `${(leader.score - runnerUp.score).toFixed(1)}` : "n/a",
    "Score lead over second place",
    COLORS.gold
  );
  renderMetricCard(
    slide,
    { x: 2.22, y: 4.25, w: 1.2, h: 1.2 },
    "Leader",
    leader?.company ?? "n/a",
    "Top weighted company",
    COLORS.purple
  );
  renderMetricCard(
    slide,
    { x: 3.49, y: 4.25, w: 1.2, h: 1.2 },
    "Signal",
    nl.engagementRate?.company ?? "n/a",
    "Best audience response",
    COLORS.green
  );

  const whyLines = vm.report.executiveSummary
    .concat([
      nl.subscribers ? `• Scale leader: ${nl.subscribers.company}` : "• Scale leader unavailable",
      nl.avgViews ? `• Reach leader: ${nl.avgViews.company}` : "• Reach leader unavailable",
      nl.postingFrequency ? `• Cadence leader: ${nl.postingFrequency.company}` : "• Cadence leader unavailable",
      nl.consistency ? `• Consistency leader: ${nl.consistency.company}` : "• Consistency leader unavailable"
    ])
    .join("\n");

  renderCallout(
    slide,
    { x: 5.25, y: 1.32, w: 3.25, h: 4.95 },
    "Why this matters",
    whyLines,
    COLORS.purple,
    6
  );

  renderCallout(
    slide,
    { x: 8.7, y: 1.32, w: 3.9, h: 4.95 },
    "Decision summary",
    [
      `• Leader: ${leader?.company ?? "n/a"}`,
      `• Runner-up: ${runnerUp?.company ?? "n/a"}`,
      `• Best audience response: ${nl.engagementRate?.company ?? "n/a"}`,
      `• Most active cadence: ${nl.postingFrequency?.company ?? "n/a"}`,
      `• Best content breadth: ${nl.contentDiversity?.company ?? "n/a"}`
    ].join("\n"),
    COLORS.cyan,
    5
  );
};
