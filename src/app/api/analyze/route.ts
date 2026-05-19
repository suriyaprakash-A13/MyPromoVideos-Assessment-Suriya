import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildReport } from "@/lib/analyze";
import { discoverCompanyChannel } from "@/lib/search";
import { extractCompanyVideoData } from "@/lib/scrapeYoutube";

const inputSchema = z.object({
  primaryCompany: z.string().min(2).max(80),
  competitors: z.array(z.string().min(2).max(80)).max(4)
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = inputSchema.parse(await request.json());

    const allCompanies = [payload.primaryCompany, ...payload.competitors]
      .map((name) => name.trim())
      .filter((name, index, arr) => name && arr.findIndex((n) => n.toLowerCase() === name.toLowerCase()) === index);

    const discoveries = await Promise.all(allCompanies.map((company) => discoverCompanyChannel(company)));
    const companyData = await Promise.all(discoveries.map((discovery) => extractCompanyVideoData(discovery)));
    const report = buildReport(payload.primaryCompany, payload.competitors, companyData);

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid input.",
          issues: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Analysis failed due to upstream scraping/search issue.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
