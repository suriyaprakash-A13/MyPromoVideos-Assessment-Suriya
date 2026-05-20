import { COLORS, FONTS, TYPOGRAPHY, LINE_SPACING, ACCENT_CYCLE } from "@/lib/ppt/theme";
import { contentRect, rowOfRects } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, renderCallout, renderMetricCard, textBlock } from "@/lib/ppt/components";

export const buildBestTimeSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Best Time to Post", "When top-performing videos were published across the competitive set");

  const { slide } = ctx;
  const insight = vm.report.bestTimeToPost;
  const main = contentRect();

  if (!insight) {
    renderCallout(
      slide,
      main,
      "Insufficient timing data",
      "Not enough videos with parseable publish dates to recommend a posting window. Use YouTube API data or a larger video sample.",
      COLORS.muted,
      4
    );
    return;
  }

  const metricCount = insight.bestHourRange ? 4 : 3;
  const metricRects = rowOfRects(metricCount, main.y, 1.12);
  const metrics = [
    { label: "Engagement lift", value: `${insight.engagementMultiplier}×`, detail: "Vs channel average in benchmark", accent: COLORS.magenta },
    { label: "Best days", value: insight.bestDayRange, detail: "Top performer window", accent: COLORS.teal },
    ...(insight.bestHourRange
      ? [{ label: "Best hours", value: insight.bestHourRange, detail: "UTC publish time", accent: ACCENT_CYCLE[2] }]
      : []),
    { label: "Confidence", value: insight.confidence, detail: `${insight.sampleSize} top videos analyzed`, accent: ACCENT_CYCLE[3] }
  ];

  metrics.forEach((m, i) => {
    renderMetricCard(slide, metricRects[i], m.label, m.value, m.detail, m.accent);
  });

  const calloutRect = {
    x: main.x,
    y: main.y + 1.12 + 0.18,
    w: main.w,
    h: main.h - 1.12 - 0.18
  };

  renderCallout(
    slide,
    calloutRect,
    "Recommendation",
    [insight.headline, ...insight.details.map((d) => `• ${d}`)].join("\n"),
    COLORS.magenta,
    8
  );

  textBlock({
    slide,
    rect: { x: main.x, y: main.y + main.h + 0.08, w: main.w, h: 0.32 },
    text: "Timing analysis uses top-quartile videos by engagement rate across all companies in this report.",
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.muted,
    fontFace: FONTS.body,
    lineSpacing: LINE_SPACING.normal
  });
};
