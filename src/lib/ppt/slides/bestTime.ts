import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, renderCallout, renderMetricCard, textBlock } from "@/lib/ppt/components";
import { FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";

export const buildBestTimeSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Best Time to Post", "When top-performing videos were published across the competitive set");

  const { slide } = ctx;
  const insight = vm.report.bestTimeToPost;

  if (!insight) {
    renderCallout(
      slide,
      { x: MARGIN_X, y: 1.38, w: 12.0, h: 4.5 },
      "Insufficient timing data",
      "Not enough videos with parseable publish dates to recommend a posting window. Use YouTube API data or a larger video sample.",
      COLORS.muted,
      4
    );
    return;
  }

  renderMetricCard(
    slide,
    { x: MARGIN_X, y: 1.42, w: 3.2, h: 1.1 },
    "Engagement lift",
    `${insight.engagementMultiplier}×`,
    "Vs channel average in benchmark",
    COLORS.magenta
  );

  renderMetricCard(
    slide,
    { x: 4.1, y: 1.42, w: 3.2, h: 1.1 },
    "Best days",
    insight.bestDayRange,
    "Top performer window",
    COLORS.cyan
  );

  if (insight.bestHourRange) {
    renderMetricCard(
      slide,
      { x: 7.08, y: 1.42, w: 3.2, h: 1.1 },
      "Best hours",
      insight.bestHourRange,
      "UTC publish time",
      COLORS.green
    );
  }

  renderMetricCard(
    slide,
    { x: 9.12, y: 1.42, w: 3.42, h: 1.1 },
    "Confidence",
    insight.confidence,
    `${insight.sampleSize} top videos analyzed`,
    COLORS.gold
  );

  renderCallout(
    slide,
    { x: MARGIN_X, y: 2.75, w: 12.0, h: 3.55 },
    "Recommendation",
    [insight.headline, ...insight.details.map((d) => `• ${d}`)].join("\n"),
    COLORS.magenta,
    8
  );

  textBlock({
    slide,
    rect: { x: MARGIN_X, y: 6.55, w: 12.0, h: 0.35 },
    text: "Timing analysis uses top-quartile videos by engagement rate across all companies in this report.",
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.muted,
    fontFace: FONTS.body
  });
};
