import { COLORS, BRAND, FONTS, TYPOGRAPHY, TOTAL_SLIDES } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderCoverBackground, renderMetricCard, renderPill, textBlock, panelRect } from "@/lib/ppt/components";

export const buildCoverSlide: SlideBuilder = (ctx, vm) => {
  const { slide } = ctx;
  const topScore = vm.scoresRanked[0];

  renderCoverBackground(ctx);

  panelRect(slide, { x: 0.78, y: 0.95, w: 7.6, h: 5.55 }, COLORS.bg2);
  panelRect(slide, { x: 8.67, y: 0.95, w: 3.95, h: 5.55 });

  textBlock({
    slide,
    rect: { x: 1.08, y: 1.28, w: 6.9, h: 0.92 },
    text: BRAND.deckTitle,
    fontFace: FONTS.display,
    fontSize: TYPOGRAPHY.coverTitle,
    color: COLORS.white,
    bold: true
  });

  textBlock({
    slide,
    rect: { x: 1.1, y: 2.25, w: 6.9, h: 0.38 },
    text: vm.companies.join(" vs "),
    fontSize: 15.5,
    color: COLORS.inkSoft
  });

  textBlock({
    slide,
    rect: { x: 1.1, y: 2.64, w: 6.9, h: 0.24 },
    text: "Prepared from publicly available video and channel data",
    fontSize: TYPOGRAPHY.bodySm,
    color: COLORS.muted
  });

  textBlock({
    slide,
    rect: { x: 1.1, y: 3.03, w: 4, h: 0.22 },
    text: `Report date: ${vm.requestedDate}`,
    fontSize: TYPOGRAPHY.bodySm,
    color: COLORS.cyan
  });

  renderPill(slide, 1.1, 3.42, "Public data only", COLORS.panel3);
  renderPill(slide, 2.63, 3.42, "Insight-led slides", COLORS.panel3);
  renderPill(slide, 4.35, 3.42, "Client-ready export", COLORS.panel3);

  renderMetricCard(
    slide,
    { x: 9.0, y: 1.25, w: 3.05, h: 0.88 },
    "Companies analyzed",
    `${vm.companies.length}`,
    "Primary brand plus competitors",
    COLORS.purple
  );
  renderMetricCard(
    slide,
    { x: 9.0, y: 2.26, w: 3.05, h: 0.88 },
    "Lead company",
    topScore?.company ?? "n/a",
    `Top weighted score: ${topScore ? topScore.score.toFixed(1) : "n/a"}`,
    COLORS.cyan
  );
  renderMetricCard(
    slide,
    { x: 9.0, y: 3.27, w: 3.05, h: 0.88 },
    "Slide sections",
    `${TOTAL_SLIDES}`,
    "Executive, timing, charts, gaps, ranking, methodology",
    COLORS.gold
  );
  renderMetricCard(
    slide,
    { x: 9.0, y: 4.28, w: 3.05, h: 0.88 },
    "Output format",
    "PPTX",
    "Professional layout and speaker-ready structure",
    COLORS.green
  );

  textBlock({
    slide,
    rect: { x: 9.0, y: 5.4, w: 2.7, h: 0.22 },
    text: "Included in this deck",
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted
  });

  textBlock({
    slide,
    rect: { x: 9.0, y: 5.66, w: 3.0, h: 0.9 },
    text: [
      "• Executive summary of the leader and why",
      "• Channel, content, cadence, and engagement views",
      "• Top videos, missing themes, and gap opportunities",
      "• Final ranking with transparent scoring logic"
    ].join("\n"),
    fontSize: TYPOGRAPHY.footnote,
    color: COLORS.text
  });
};
