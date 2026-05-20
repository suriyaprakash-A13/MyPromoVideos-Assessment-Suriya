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
        color: COLORS.onAccent,
        fill: { color: COLORS.teal },
        fontFace: FONTS.display,
        fontSize: TYPOGRAPHY.tableHeader
      }
    })),
    ...rows.map((row, rowIndex) =>
      row.cells.map((cell) => ({
        text: cell,
        options: {
          color: COLORS.text,
          fill: { color: rowIndex % 2 === 0 ? COLORS.white : COLORS.panel2 },
          fontFace: FONTS.body,
          fontSize: TYPOGRAPHY.tableCell
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
    border: { type: "solid", color: COLORS.lineSoft, pt: 0.75 },
    margin: [8, 10, 8, 10],
    valign: "middle",
    autoPage: false
  });
}
