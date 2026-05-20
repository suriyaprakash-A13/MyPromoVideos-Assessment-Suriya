import { COLORS, FONTS, TYPOGRAPHY, LINE_SPACING, ACCENT_CYCLE } from "@/lib/ppt/theme";
import { gridCell, rowOfRects } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, renderCallout, renderMetricCard, panelRect, textBlock } from "@/lib/ppt/components";

export const buildExecutiveSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Executive Summary", "Who leads in video marketing and why");

  const { slide } = ctx;
  const leader = vm.scoresRanked[0];
  const runnerUp = vm.scoresRanked[1];
  const nl = vm.normalizedLeaders;

  const leaderRect = gridCell(0, 0, 4, 6);
  const whyRect = gridCell(4, 0, 4, 6);
  const decisionRect = gridCell(8, 0, 4, 6);
  const leaderPad = { x: leaderRect.x + 0.16, y: leaderRect.y + 0.16, w: leaderRect.w - 0.32, h: leaderRect.h - 0.32 };

  panelRect(slide, leaderRect, COLORS.panel, COLORS.lineSoft);

  textBlock({
    slide,
    rect: { x: leaderPad.x, y: leaderPad.y, w: leaderPad.w, h: 0.22 },
    text: "Overall leader",
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted,
    valign: "middle"
  });

  textBlock({
    slide,
    rect: { x: leaderPad.x, y: leaderPad.y + 0.28, w: leaderPad.w, h: 0.48 },
    text: leader?.company ?? "n/a",
    fontFace: FONTS.display,
    fontSize: TYPOGRAPHY.metricValue,
    color: COLORS.ink,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: leaderPad.x, y: leaderPad.y + 0.82, w: leaderPad.w, h: 0.22 },
    text: `Weighted score ${leader ? leader.score.toFixed(1) : "n/a"}`,
    fontSize: TYPOGRAPHY.bodySm,
    color: COLORS.teal,
    valign: "middle"
  });

  textBlock({
    slide,
    rect: { x: leaderPad.x, y: leaderPad.y + 1.12, w: leaderPad.w, h: 1.35 },
    text: [
      "• Leader advantage comes from scale, cadence, and consistency.",
      "• Runner-up pressure is strongest where reach is high but cadence trails.",
      "• Biggest opportunity: convert topic breadth into repeatable engagement."
    ].join("\n"),
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.text,
    lineSpacing: LINE_SPACING.relaxed
  });

  const miniCards = rowOfRects(3, leaderPad.y + leaderPad.h - 1.35, 1.2, 0.12);
  const miniAccents = [ACCENT_CYCLE[0], ACCENT_CYCLE[1], ACCENT_CYCLE[2]];
  const miniData = [
    { label: "Gap", value: runnerUp && leader ? `${(leader.score - runnerUp.score).toFixed(1)}` : "n/a", detail: "Score lead over second place" },
    { label: "Leader", value: leader?.company ?? "n/a", detail: "Top weighted company" },
    { label: "Signal", value: nl.engagementRate?.company ?? "n/a", detail: "Best audience response" }
  ];

  miniCards.forEach((rect, i) => {
    renderMetricCard(slide, rect, miniData[i].label, miniData[i].value, miniData[i].detail, miniAccents[i]);
  });

  const whyLines = vm.report.executiveSummary
    .concat([
      nl.subscribers ? `• Scale leader: ${nl.subscribers.company}` : "• Scale leader unavailable",
      nl.avgViews ? `• Reach leader: ${nl.avgViews.company}` : "• Reach leader unavailable",
      nl.postingFrequency ? `• Cadence leader: ${nl.postingFrequency.company}` : "• Cadence leader unavailable",
      nl.consistency ? `• Consistency leader: ${nl.consistency.company}` : "• Consistency leader unavailable"
    ])
    .join("\n");

  renderCallout(slide, whyRect, "Why this matters", whyLines, ACCENT_CYCLE[1], 6);

  renderCallout(
    slide,
    decisionRect,
    "Decision summary",
    [
      `• Leader: ${leader?.company ?? "n/a"}`,
      `• Runner-up: ${runnerUp?.company ?? "n/a"}`,
      `• Best audience response: ${nl.engagementRate?.company ?? "n/a"}`,
      `• Most active cadence: ${nl.postingFrequency?.company ?? "n/a"}`,
      `• Best content breadth: ${nl.contentDiversity?.company ?? "n/a"}`
    ].join("\n"),
    ACCENT_CYCLE[0],
    5
  );
};
