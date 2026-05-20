export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;

export const MARGIN_X = 0.8;
export const GUTTER = 0.16;
export const CARD_GAP = 0.14;

export const HEADER_BAND_H = 0.36;
export const TITLE_Y = 0.42;
export const SUBTITLE_Y = 0.78;
export const HEADER_RULE_Y = 1.04;
export const CONTENT_TOP = 1.2;
export const FOOTER_Y = 7.05;
export const CONTENT_BOTTOM = 6.42;

/** Reserved band for footer labels / bullets (keeps main content from overlapping). */
export const FOOTER_BAND_H = 1.05;
export const MAIN_BOTTOM = CONTENT_BOTTOM - FOOTER_BAND_H;
export const FOOTER_LABEL_Y = MAIN_BOTTOM + 0.06;
export const FOOTER_BULLETS_Y = MAIN_BOTTOM + 0.3;

export const CONTENT_W = SLIDE_W - MARGIN_X * 2;
export const CONTENT_H = CONTENT_BOTTOM - CONTENT_TOP;
export const MAIN_CONTENT_H = MAIN_BOTTOM - CONTENT_TOP;

export const SIDEBAR_W = 3.48;
export const CHART_MAIN_W = CONTENT_W - SIDEBAR_W - GUTTER;

export const GRID_COLS = 12;
export const GRID_ROWS = 6;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function insetRect(rect: Rect, pad: number): Rect {
  return {
    x: rect.x + pad,
    y: rect.y + pad,
    w: Math.max(0.1, rect.w - pad * 2),
    h: Math.max(0.1, rect.h - pad * 2)
  };
}

export function contentRect(): Rect {
  return { x: MARGIN_X, y: CONTENT_TOP, w: CONTENT_W, h: CONTENT_H };
}

export function contentRectAboveFooter(): Rect {
  return { x: MARGIN_X, y: CONTENT_TOP, w: CONTENT_W, h: MAIN_CONTENT_H };
}

export function gridCell(col: number, row: number, colSpan = 1, rowSpan = 1): Rect {
  const colW = CONTENT_W / GRID_COLS;
  const rowH = CONTENT_H / GRID_ROWS;
  return {
    x: MARGIN_X + col * colW,
    y: CONTENT_TOP + row * rowH,
    w: colSpan * colW,
    h: rowSpan * rowH
  };
}

/** Grid cell that stays above the footer band (for slides with footer notes). */
export function gridCellAboveFooter(col: number, row: number, colSpan = 1, rowSpan = 1): Rect {
  const colW = CONTENT_W / GRID_COLS;
  const rowH = MAIN_CONTENT_H / GRID_ROWS;
  return {
    x: MARGIN_X + col * colW,
    y: CONTENT_TOP + row * rowH,
    w: colSpan * colW,
    h: rowSpan * rowH
  };
}

export function columnWidth(count: number, gap = CARD_GAP, totalW = CONTENT_W): number {
  const safeCount = Math.max(1, count);
  return (totalW - (safeCount - 1) * gap) / safeCount;
}

/** Chart + right sidebar (metrics / notes). */
export function chartWithSidebarLayout(reserveFooter = false): { chart: Rect; sidebar: Rect } {
  const base = reserveFooter ? contentRectAboveFooter() : contentRect();
  return {
    chart: { x: base.x, y: base.y, w: CHART_MAIN_W, h: base.h },
    sidebar: { x: base.x + CHART_MAIN_W + GUTTER, y: base.y, w: SIDEBAR_W, h: base.h }
  };
}

/** Full-width chart on top, cards row below. */
export function chartWithCardsBelow(chartH = 2.05, reserveFooter = false): {
  chart: Rect;
  cardsY: number;
  cardsH: number;
} {
  const base = reserveFooter ? contentRectAboveFooter() : contentRect();
  return {
    chart: { x: base.x, y: base.y, w: base.w, h: chartH },
    cardsY: base.y + chartH + GUTTER,
    cardsH: base.h - chartH - GUTTER
  };
}

export function rowOfRects(count: number, y: number, h: number, gap = CARD_GAP): Rect[] {
  const w = columnWidth(count, gap);
  return Array.from({ length: count }, (_, i) => ({
    x: MARGIN_X + i * (w + gap),
    y,
    w,
    h
  }));
}

export function stackRects(count: number, rect: Rect, gap = 0.12): Rect[] {
  if (count <= 0) {
    return [];
  }
  const h = (rect.h - (count - 1) * gap) / count;
  return Array.from({ length: count }, (_, i) => ({
    x: rect.x,
    y: rect.y + i * (h + gap),
    w: rect.w,
    h
  }));
}

export function footerNoteRect(): Rect {
  return {
    x: MARGIN_X,
    y: FOOTER_BULLETS_Y,
    w: CONTENT_W,
    h: CONTENT_BOTTOM - FOOTER_BULLETS_Y - 0.08
  };
}

export function twoColumnSplit(gap = GUTTER): { left: Rect; right: Rect } {
  const base = contentRect();
  const colW = (base.w - gap) / 2;
  return {
    left: { x: base.x, y: base.y, w: colW, h: base.h },
    right: { x: base.x + colW + gap, y: base.y, w: colW, h: base.h }
  };
}
