import PptxGenJS from "pptxgenjs";
import { ReportPayload } from "@/lib/types";
import { buildReportViewModel } from "@/lib/ppt/reportModel";
import { SLIDE_BUILDERS } from "@/lib/ppt/slides";

export async function generatePpt(report: ReportPayload): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Mypromovdos Analyzer";
  pptx.company = report.primaryCompany;
  pptx.subject = "Video marketing benchmark report";
  pptx.title = `Video Strategy Benchmark - ${report.primaryCompany}`;

  const vm = buildReportViewModel(report);

  SLIDE_BUILDERS.forEach((builder, index) => {
    const slide = pptx.addSlide();
    builder({ pptx, slide, page: index + 1 }, vm);
  });

  return (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
}
