import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X, CONTENT_BOTTOM } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, renderCallout, renderSlideTable, panelRect, textBlock } from "@/lib/ppt/components";
import { TYPOGRAPHY } from "@/lib/ppt/theme";

const WEIGHT_ROWS = [
  { label: "Subscribers", value: "25%", accent: COLORS.purple },
  { label: "Avg views", value: "20%", accent: COLORS.cyan },
  { label: "Engagement rate", value: "20%", accent: COLORS.green },
  { label: "Posting frequency", value: "15%", accent: COLORS.gold },
  { label: "Consistency", value: "10%", accent: COLORS.violet },
  { label: "Content diversity", value: "10%", accent: COLORS.red }
];

export const buildMethodologySlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Methodology and Scoring Logic", "How to interpret the analysis and the ranking");

  const { slide } = ctx;
  const leader = vm.scoresRanked[0];
  const nl = vm.normalizedLeaders;

  panelRect(slide, { x: MARGIN_X, y: 1.38, w: 4.05, h: 4.95 }, COLORS.panel2);

  textBlock({
    slide,
    rect: { x: 0.98, y: 1.63, w: 2.3, h: 0.2 },
    text: "Weighted scoring model",
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted
  });

  renderSlideTable(
    slide,
    { x: 1.02, y: 1.95, w: 3.5, h: 3.2 },
    ["Metric", "Weight"],
    WEIGHT_ROWS.map((row) => ({ cells: [row.label, row.value] }))
  );

  renderCallout(
    slide,
    { x: 5.0, y: 1.38, w: 3.7, h: 2.25 },
    "How to read the results",
    [
      "• Scores reward both scale and sustained performance.",
      "• A high score needs more than one strong metric.",
      "• Topic diversity matters when channels compete for attention.",
      "• Cadence and consistency reduce volatility across a campaign window."
    ].join("\n"),
    COLORS.purple,
    5
  );

  renderCallout(
    slide,
    { x: 8.92, y: 1.38, w: 3.68, h: 2.25 },
    "Data quality guidance",
    [
      "• Full data means channel and video metrics were available.",
      "• Partial or limited data uses conservative fallback inference.",
      "• The report stays useful without false precision where data is thin."
    ].join("\n"),
    COLORS.cyan,
    4
  );

  renderCallout(
    slide,
    { x: 5.0, y: 3.92, w: 7.6, h: 2.41 },
    "Interpretation note",
    [
      `• Leader: ${leader?.company ?? "n/a"}`,
      `• Strongest reach: ${nl.avgViews?.company ?? "n/a"}`,
      `• Strongest response: ${nl.engagementRate?.company ?? "n/a"}`,
      `• Best cadence: ${nl.postingFrequency?.company ?? "n/a"}`,
      `• Best breadth: ${nl.contentDiversity?.company ?? "n/a"}`
    ].join("\n"),
    COLORS.gold,
    5
  );

  textBlock({
    slide,
    rect: { x: MARGIN_X, y: CONTENT_BOTTOM + 0.27, w: 12.0, h: 0.28 },
    text: "The goal is to surface which companies are winning, why they are winning, and where the next content advantage is likely to come from.",
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.text
  });
};
