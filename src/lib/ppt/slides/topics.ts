import { COLORS, FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";
import { gridCellAboveFooter, insetRect } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderPill, panelRect, textBlock, renderFooterLabel, renderFooterBullets } from "@/lib/ppt/components";
import { truncateText } from "@/lib/ppt/format";

export const buildTopicsSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Content Topics and Themes", "What each company covers and what they are missing");

  const { slide, pptx } = ctx;
  const chartRect = gridCellAboveFooter(0, 0, 5, 6);
  const coverageRect = gridCellAboveFooter(5, 0, 7, 6);
  const coveragePad = insetRect(coverageRect, 0.28);

  addThemedChart(
    slide,
    pptx,
    pptx.ChartType.bar,
    [
      {
        name: "Content category frequency",
        labels: vm.categoryRanking.map((item) => item.topic),
        values: vm.categoryRanking.map((item) => item.count)
      }
    ],
    chartRect,
    { barDir: "bar", showLegend: false }
  );

  panelRect(slide, coverageRect, COLORS.panel, COLORS.lineSoft);

  const headerH = 0.26;
  textBlock({
    slide,
    rect: { x: coveragePad.x, y: coveragePad.y, w: coveragePad.w, h: headerH },
    text: "Coverage by company",
    fontSize: TYPOGRAPHY.captionMd,
    color: COLORS.muted,
    bold: true,
    valign: "middle"
  });

  const companyCount = Math.max(1, vm.themeCoverageByCompany.length);
  const rowCount = Math.ceil(companyCount / 2);
  const cardGapX = 0.14;
  const cardGapY = 0.12;
  const gridTop = coveragePad.y + headerH + 0.08;
  const gridH = coveragePad.y + coveragePad.h - gridTop - 0.06;
  const colW = (coveragePad.w - cardGapX) / 2;
  const rowH = (gridH - cardGapY * (rowCount - 1)) / rowCount;
  const maxMissingChars = Math.max(28, Math.floor(colW * 14));

  vm.themeCoverageByCompany.forEach((item, index) => {
    const columnX = coveragePad.x + (index % 2) * (colW + cardGapX);
    const rowIndex = Math.floor(index / 2);
    const cardRect = {
      x: columnX,
      y: gridTop + rowIndex * (rowH + cardGapY),
      w: colW,
      h: rowH
    };

    panelRect(slide, cardRect, COLORS.panel2, COLORS.lineSoft);

    textBlock({
      slide,
      rect: { x: cardRect.x + 0.1, y: cardRect.y + 0.08, w: cardRect.w - 0.2, h: 0.2 },
      text: truncateText(item.company, 22),
      fontFace: FONTS.display,
      fontSize: TYPOGRAPHY.captionMd,
      color: COLORS.ink,
      bold: true,
      valign: "middle",
      fit: "shrink"
    });

    let pillX = cardRect.x + 0.1;
    const pillY = cardRect.y + 0.3;
    const pillMaxW = cardRect.w - 0.2;
    item.topics.slice(0, 2).forEach((topic) => {
      if (pillX > cardRect.x + pillMaxW - 0.5) {
        return;
      }
      const width = renderPill(slide, pillX, pillY, truncateText(topic, 14), COLORS.panelTeal, COLORS.ink);
      pillX += width + 0.06;
    });

    const missingLabel = item.missing.length
      ? truncateText(item.missing.slice(0, 2).join(", "), maxMissingChars)
      : "No major blind spots";

    textBlock({
      slide,
      rect: { x: cardRect.x + 0.1, y: cardRect.y + 0.62, w: cardRect.w - 0.2, h: cardRect.h - 0.7 },
      text: `Missing: ${missingLabel}`,
      fontSize: TYPOGRAPHY.footnote,
      color: COLORS.muted,
      valign: "top",
      fit: "shrink"
    });
  });

  renderFooterLabel(slide, "Most common content gaps in the set");
  renderFooterBullets(
    slide,
    vm.themeCoverageByCompany.map(
      (item) => `${item.company}: ${item.missing.slice(0, 2).join(", ") || "limited strategic gaps"}`
    )
  );
};
