import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePpt } from "@/lib/ppt";
import { ReportPayload } from "@/lib/types";

const reportSchema = z.object({
  report: z.custom<ReportPayload>()
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { report } = reportSchema.parse(await request.json());
    const buffer = await generatePpt(report);
    const bytes = new Uint8Array(buffer);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="video-benchmark-${Date.now()}.pptx"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to generate PPTX.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
