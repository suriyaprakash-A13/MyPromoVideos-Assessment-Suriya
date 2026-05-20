import { COLORS, TYPOGRAPHY, ACCENT_CYCLE } from "@/lib/ppt/theme";
import { gridCellAboveFooter } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, renderCallout, renderSlideTable, panelRect, textBlock, renderFooterNote } from "@/lib/ppt/components";

const WEIGHT_ROWS = [
  { label: "Subscribers", value: "25%" },
  { label: "Avg views", value: "20%" },
  { label: "Engagement rate", value: "20%" },
  { label: "Posting frequency", value: "15%" },
  { label: "Consistency", value: "10%" },
  { label: "Content diversity", value: "10%" }
];

export const buildMethodologySlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Methodology and Scoring Logic", "How to interpret the analysis and the ranking");

  const { slide } = ctx;
  const leader = vm.scoresRanked[0];
  const nl = vm.normalizedLeaders;

  const weightsRect = gridCellAboveFooter(0, 0, 4, 6);
  const readRect = gridCellAboveFooter(4, 0, 4, 3);
  const qualityRect = gridCellAboveFooter(8, 0, 4, 3);
  const noteRect = gridCellAboveFooter(4, 3, 8, 3);

  panelRect(slide, weightsRect, COLORS.panelTeal);

  textBlock({
    slide,
    rect: { x: weightsRect.x + 0.18, y: weightsRect.y + 0.18, w: weightsRect.w - 0.36, h: 0.24 },
    text: "Weighted scoring model",
    fontSize: TYPOGRAPHY.captionMd,
    color: COLORS.teal,
    bold: true,
    valign: "middle"
  });

  renderSlideTable(
    slide,
    { x: weightsRect.x + 0.22, y: weightsRect.y + 0.5, w: weightsRect.w - 0.44, h: weightsRect.h - 0.68 },
    ["Metric", "Weight"],
    WEIGHT_ROWS.map((row) => ({ cells: [row.label, row.value] }))
  );

  renderCallout(
    slide,
    readRect,
    "How to read the results",
    [
      "• Scores reward both scale and sustained performance.",
      "• A high score needs more than one strong metric.",
      "• Topic diversity matters when channels compete for attention.",
      "• Cadence and consistency reduce volatility across a campaign window."
    ].join("\n"),
    ACCENT_CYCLE[0],
    5
  );

  renderCallout(
    slide,
    qualityRect,
    "Data quality guidance",
    [
      "• Full data means channel and video metrics were available.",
      "• Partial or limited data uses conservative fallback inference.",
      "• The report stays useful without false precision where data is thin."
    ].join("\n"),
    ACCENT_CYCLE[1],
    4
  );

  renderCallout(
    slide,
    noteRect,
    "Interpretation note",
    [
      `• Leader: ${leader?.company ?? "n/a"}`,
      `• Strongest reach: ${nl.avgViews?.company ?? "n/a"}`,
      `• Strongest response: ${nl.engagementRate?.company ?? "n/a"}`,
      `• Best cadence: ${nl.postingFrequency?.company ?? "n/a"}`,
      `• Best breadth: ${nl.contentDiversity?.company ?? "n/a"}`
    ].join("\n"),
    ACCENT_CYCLE[2],
    5
  );

  renderFooterNote(
    slide,
    "The goal is to surface which companies are winning, why they are winning, and where the next content advantage is likely to come from."
  );
};
