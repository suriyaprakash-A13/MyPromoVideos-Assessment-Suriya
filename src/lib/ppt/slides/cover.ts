import PptxGenJS from "pptxgenjs";
import { COLORS, BRAND, FONTS, TYPOGRAPHY, TOTAL_SLIDES, LINE_SPACING, ACCENT_CYCLE, ACCENT_BAR_W } from "@/lib/ppt/theme";
import { MARGIN_X, CONTENT_W, GUTTER, CONTENT_TOP, insetRect } from "@/lib/ppt/layout";
import { Rect, SlideBuilder } from "@/lib/ppt/types";
import { renderCoverBackground, textBlock, panelRect } from "@/lib/ppt/components";
import { accentBar } from "@/lib/ppt/components/shapes";
import { truncateText } from "@/lib/ppt/format";

/** Cover-only stat tile — larger type than standard metric cards. */
function renderCoverStat(
  slide: PptxGenJS.Slide,
  rect: Rect,
  label: string,
  value: string,
  detail: string,
  accent: string
): void {
  panelRect(slide, rect, COLORS.white, COLORS.lineSoft);
  accentBar(slide, rect, accent);

  const textX = rect.x + 0.16 + ACCENT_BAR_W + 0.06;
  const textW = rect.w - (textX - rect.x) - 0.1;

  textBlock({
    slide,
    rect: { x: textX, y: rect.y + 0.1, w: textW, h: 0.22 },
    text: label.toUpperCase(),
    fontSize: 10,
    color: COLORS.muted,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: textX, y: rect.y + 0.32, w: textW, h: 0.42 },
    text: value,
    fontFace: FONTS.display,
    fontSize: 22,
    color: COLORS.ink,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });

  textBlock({
    slide,
    rect: { x: textX, y: rect.y + 0.74, w: textW, h: rect.h - 0.82 },
    text: detail,
    fontSize: 11,
    color: COLORS.muted,
    valign: "top",
    fit: "shrink"
  });
}

export const buildCoverSlide: SlideBuilder = (ctx, vm) => {
  const { slide } = ctx;
  const topScore = vm.scoresRanked[0];
  const topY = 0.88;
  const panelH = 5.72;
  const leftW = CONTENT_W * 0.58;
  const rightW = CONTENT_W - leftW - GUTTER;
  const leftX = MARGIN_X;
  const rightX = leftX + leftW + GUTTER;

  renderCoverBackground(ctx);

  panelRect(slide, { x: leftX, y: topY, w: leftW, h: panelH }, COLORS.panelTeal);
  panelRect(slide, { x: rightX, y: topY, w: rightW, h: panelH }, COLORS.panelMagenta);

  const left = insetRect({ x: leftX, y: topY, w: leftW, h: panelH }, 0.26);
  const leftBottom = left.y + left.h;
  let y = left.y;

  textBlock({
    slide,
    rect: { x: left.x, y, w: left.w, h: 1.05 },
    text: BRAND.deckTitle,
    fontFace: FONTS.display,
    fontSize: 34,
    color: COLORS.ink,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });
  y += 1.12;

  textBlock({
    slide,
    rect: { x: left.x, y, w: left.w, h: 0.52 },
    text: vm.companies.join(" vs "),
    fontSize: 19,
    color: COLORS.teal,
    bold: true,
    valign: "middle",
    fit: "shrink"
  });
  y += 0.58;

  textBlock({
    slide,
    rect: { x: left.x, y, w: left.w, h: 0.36 },
    text: "Prepared from publicly available video and channel data",
    fontSize: 13.5,
    color: COLORS.muted,
    lineSpacing: LINE_SPACING.normal,
    valign: "middle",
    fit: "shrink"
  });
  y += 0.42;

  textBlock({
    slide,
    rect: { x: left.x, y, w: left.w, h: 0.3 },
    text: `Report date: ${vm.requestedDate}`,
    fontSize: 13.5,
    color: COLORS.magenta,
    bold: true,
    valign: "middle"
  });
  y += 0.38;

  textBlock({
    slide,
    rect: { x: left.x, y, w: left.w, h: 0.28 },
    text: "Report highlights",
    fontSize: 12,
    color: COLORS.teal,
    bold: true,
    valign: "middle"
  });
  y += 0.32;

  textBlock({
    slide,
    rect: { x: left.x, y, w: left.w, h: leftBottom - y - 0.06 },
    text: ["• Public data only", "• Insight-led slides", "• Client-ready export"].join("\n"),
    fontSize: 13.5,
    color: COLORS.text,
    lineSpacing: 22,
    valign: "top",
    fit: "shrink"
  });

  const right = insetRect({ x: rightX, y: topY, w: rightW, h: panelH }, 0.2);
  const statsH = right.h * 0.54;
  const deckTop = right.y + statsH + 0.14;
  const gap = 0.12;
  const cellW = (right.w - gap) / 2;
  const cellH = (statsH - gap) / 2;

  const stats = [
    { label: "Companies", value: `${vm.companies.length}`, detail: "In this benchmark", accent: ACCENT_CYCLE[0] },
    {
      label: "Lead company",
      value: truncateText(topScore?.company ?? "n/a", 14),
      detail: `Score ${topScore ? topScore.score.toFixed(1) : "n/a"}`,
      accent: ACCENT_CYCLE[1]
    },
    { label: "Sections", value: `${TOTAL_SLIDES}`, detail: "Slides in deck", accent: ACCENT_CYCLE[2] },
    { label: "Format", value: "PPTX", detail: "Ready to present", accent: ACCENT_CYCLE[3] }
  ];

  stats.forEach((stat, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    renderCoverStat(
      slide,
      {
        x: right.x + col * (cellW + gap),
        y: right.y + row * (cellH + gap),
        w: cellW,
        h: cellH
      },
      stat.label,
      stat.value,
      stat.detail,
      stat.accent
    );
  });

  textBlock({
    slide,
    rect: { x: right.x, y: deckTop, w: right.w, h: 0.28 },
    text: "Included in this deck",
    fontSize: 13,
    color: COLORS.inkPink,
    bold: true,
    valign: "middle"
  });

  textBlock({
    slide,
    rect: { x: right.x, y: deckTop + 0.32, w: right.w, h: right.y + right.h - deckTop - 0.38 },
    text: [
      "• Executive summary & trend velocity",
      "• Best time to post insights",
      "• Channel, content & engagement analysis",
      "• Gap analysis, ranking & methodology"
    ].join("\n"),
    fontSize: 12.5,
    color: COLORS.text,
    lineSpacing: 20,
    valign: "top",
    fit: "shrink"
  });
};
