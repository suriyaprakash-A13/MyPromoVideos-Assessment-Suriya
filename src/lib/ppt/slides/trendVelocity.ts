import { COLORS, TYPOGRAPHY } from "@/lib/ppt/theme";
import { contentRectAboveFooter, insetRect, MARGIN_X, CONTENT_W, FOOTER_BULLETS_Y } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, renderCallout, renderSlideTable, panelRect, textBlock } from "@/lib/ppt/components";
import { fmtCompact, fmtPct } from "@/lib/ppt/format";
import { formatTrendChange, trendArrow } from "@/lib/trendVelocity";

export const buildTrendVelocitySlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Trend Velocity Tracker", "Recent uploads vs prior batch — momentum, not just a snapshot");

  const { slide } = ctx;
  const velocity = vm.report.trendVelocity;

  if (!velocity) {
    renderCallout(
      slide,
      contentRectAboveFooter(),
      "Insufficient video history",
      "Need at least 8 dated uploads per channel to compare recent vs prior windows. Add YOUTUBE_API_KEY to pull up to 60 recent videos per channel.",
      COLORS.muted,
      5
    );
    return;
  }

  const main = contentRectAboveFooter();
  const pad = insetRect(main, 0.2);

  panelRect(slide, main, COLORS.panel, COLORS.lineSoft);

  textBlock({
    slide,
    rect: { x: pad.x, y: pad.y, w: pad.w, h: 0.32 },
    text: velocity.headline,
    fontSize: TYPOGRAPHY.bodyLg,
    color: COLORS.ink,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: pad.x, y: pad.y + 0.36, w: pad.w, h: 0.26 },
    text: velocity.windowDescription,
    fontSize: TYPOGRAPHY.bodyMd,
    color: COLORS.muted,
    valign: "top"
  });

  const rows = velocity.companies.map((entry) => ({
    cells: [
      entry.company,
      `${fmtCompact(entry.avgViews.recent)} ${formatTrendChange(entry.avgViews.direction, entry.avgViews.changePct)}`,
      `${fmtPct(entry.engagementRate.recent, 2)} ${formatTrendChange(entry.engagementRate.direction, entry.engagementRate.changePct)}`,
      `${entry.uploadsPerWeek.recent.toFixed(1)}/wk ${formatTrendChange(entry.uploadsPerWeek.direction, entry.uploadsPerWeek.changePct)}`,
      `${entry.scoreTrend.recent.toFixed(0)} ${trendArrow(entry.scoreTrend.direction)}`
    ]
  }));

  renderSlideTable(
    slide,
    { x: pad.x, y: pad.y + 0.68, w: pad.w, h: pad.h - 0.76 },
    ["Company", "Avg views", "Engagement", "Cadence", "Velocity"],
    rows
  );

  textBlock({
    slide,
    rect: { x: MARGIN_X, y: FOOTER_BULLETS_Y, w: CONTENT_W, h: 0.32 },
    text: `↑ improving  •  ↓ declining  •  → flat  |  ${velocity.improvingCount} improving, ${velocity.decliningCount} declining`,
    fontSize: TYPOGRAPHY.bodyMd,
    color: COLORS.magenta,
    valign: "middle"
  });
};
