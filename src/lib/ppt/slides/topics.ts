import { COLORS } from "@/lib/ppt/theme";
import { MARGIN_X } from "@/lib/ppt/layout";
import { SlideBuilder } from "@/lib/ppt/types";
import { renderHeader, addThemedChart, renderPill, panelRect, textBlock, renderFooterLabel, renderFooterBullets } from "@/lib/ppt/components";
import { FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";

export const buildTopicsSlide: SlideBuilder = (ctx, vm) => {
  renderHeader(ctx, "Content Topics and Themes", "What each company covers and what they are missing");

  const { slide, pptx } = ctx;

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
    { x: MARGIN_X, y: 1.38, w: 4.75, h: 4.95 },
    { barDir: "bar", showLegend: false }
  );

  panelRect(slide, { x: 5.72, y: 1.38, w: 6.87, h: 4.95 }, COLORS.panel2);

  textBlock({
    slide,
    rect: { x: 5.96, y: 1.62, w: 2.8, h: 0.2 },
    text: "Coverage by company",
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.muted
  });

  vm.themeCoverageByCompany.forEach((item, index) => {
    const columnX = 5.96 + (index % 2) * 3.25;
    const rowY = 1.9 + Math.floor(index / 2) * 1.44;

    panelRect(slide, { x: columnX, y: rowY, w: 3.02, h: 1.28 });

    textBlock({
      slide,
      rect: { x: columnX + 0.12, y: rowY + 0.1, w: 2.4, h: 0.18 },
      text: item.company,
      fontFace: FONTS.display,
      fontSize: 10.2,
      color: COLORS.white,
      bold: true
    });

    let pillX = columnX + 0.1;
    const pillY = rowY + 0.34;
    item.topics.slice(0, 2).forEach((topic) => {
      const width = renderPill(slide, pillX, pillY, topic, COLORS.panel3, COLORS.text);
      pillX += width + 0.08;
    });

    const missingLabel = item.missing.length
      ? item.missing.slice(0, 2).join(", ")
      : "No major blind spots";

    textBlock({
      slide,
      rect: { x: columnX + 0.12, y: rowY + 0.75, w: 2.74, h: 0.34 },
      text: `Missing: ${missingLabel}`,
      fontSize: TYPOGRAPHY.footnote,
      color: COLORS.muted
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
