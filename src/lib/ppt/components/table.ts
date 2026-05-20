import PptxGenJS from "pptxgenjs";
import { COLORS, FONTS, TYPOGRAPHY } from "@/lib/ppt/theme";
import { Rect } from "@/lib/ppt/types";

export interface TableRow {
  cells: string[];
}

export function renderSlideTable(
  slide: PptxGenJS.Slide,
  rect: Rect,
  headers: string[],
  rows: TableRow[]
): void {
  const tableRows: PptxGenJS.TableRow[] = [
    headers.map((cell) => ({
      text: cell,
      options: {
        bold: true,
        color: COLORS.white,
        fill: { color: COLORS.panel3 },
        fontFace: FONTS.display,
        fontSize: TYPOGRAPHY.caption
      }
    })),
    ...rows.map((row) =>
      row.cells.map((cell) => ({
        text: cell,
        options: {
          color: COLORS.text,
          fill: { color: COLORS.panel },
          fontFace: FONTS.body,
          fontSize: TYPOGRAPHY.caption
        }
      }))
    )
  ];

  slide.addTable(tableRows, {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    colW: headers.map(() => rect.w / headers.length),
    border: { type: "solid", color: COLORS.line, pt: 0.75 },
    margin: 4
  });
}
