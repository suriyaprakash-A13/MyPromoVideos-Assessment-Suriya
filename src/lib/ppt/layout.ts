export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;

export const MARGIN_X = 0.72;
export const CONTENT_TOP = 1.15;
export const CONTENT_BOTTOM = 6.35;
export const FOOTER_Y = 7.02;
export const HEADER_RULE_Y = 1.05;

export const CONTENT_W = SLIDE_W - MARGIN_X * 2;
export const CONTENT_H = CONTENT_BOTTOM - CONTENT_TOP;

export const GRID_COLS = 12;
export const GRID_ROWS = 6;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
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

export function columnWidth(count: number, gap = 0.12, totalW = CONTENT_W): number {
  const safeCount = Math.max(1, count);
  return (totalW - (safeCount - 1) * gap) / safeCount;
}

export function contentRect(): Rect {
  return {
    x: MARGIN_X,
    y: CONTENT_TOP,
    w: CONTENT_W,
    h: CONTENT_H
  };
}
