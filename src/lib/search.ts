import axios from "axios";
import * as cheerio from "cheerio";
import { CompanyDiscovery, MatchConfidence, SearchCandidate } from "@/lib/types";
import { discoverCompanyChannelViaApi, isYoutubeApiEnabled } from "@/lib/youtubeApi";

const SEARCH_TIMEOUT_MS = 12000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const KNOWN_CHANNELS: Record<string, string> = {
  apple: "https://www.youtube.com/@Apple",
  microsoft: "https://www.youtube.com/@Microsoft",
  google: "https://www.youtube.com/@Google",
  amazon: "https://www.youtube.com/@amazon",
  netflix: "https://www.youtube.com/@Netflix",
  tesla: "https://www.youtube.com/@Tesla",
  meta: "https://www.youtube.com/@Meta",
  facebook: "https://www.youtube.com/@facebook",
  instagram: "https://www.youtube.com/@instagram",
  linkedin: "https://www.youtube.com/@LinkedIn",
  uber: "https://www.youtube.com/@Uber",
  airbnb: "https://www.youtube.com/@Airbnb",
  slack: "https://www.youtube.com/@Slack",
  hubspot: "https://www.youtube.com/@HubSpot",
  salesforce: "https://www.youtube.com/@salesforce",
  zoho: "https://www.youtube.com/@ZohoCRM",
  atlassian: "https://www.youtube.com/@atlassian",
  figma: "https://www.youtube.com/@figma_design",
  notion: "https://www.youtube.com/@NotionHQ",
  canva: "https://www.youtube.com/@canva",
  twilio: "https://www.youtube.com/@twilio",
  stripe: "https://www.youtube.com/@stripe",
  vercel: "https://www.youtube.com/@vercel",
  github: "https://www.youtube.com/@GitHub",
  gitlab: "https://www.youtube.com/@gitlab"
};

function confidenceFor(company: string, channelTitle: string, url: string): { confidence: MatchConfidence; reason: string } {
  const normalizedCompany = company.toLowerCase().replace(/\s+/g, "");
  const normalizedTitle = channelTitle.toLowerCase();
  const normalizedUrl = url.toLowerCase();
  const slug = company.toLowerCase().replace(/\s+/g, "-");

  const exactHandle =
    normalizedUrl.includes(`youtube.com/@${normalizedCompany}`) ||
    normalizedUrl.includes(`youtube.com/@${slug}`);

  const titleHasCompany = normalizedTitle.includes(company.toLowerCase()) || normalizedTitle.includes(normalizedCompany);
  const isChanUrl = /youtube\.com\/(channel|c|@|user)\//i.test(url);

  if (exactHandle || (titleHasCompany && isChanUrl)) {
    return { confidence: "high", reason: "Channel handle strongly matches company name." };
  }

  if (titleHasCompany && isChanUrl) {
    return { confidence: "medium", reason: "Title matches company; official channel pattern detected." };
  }

  return { confidence: "medium", reason: "YouTube channel URL pattern detected." };
}

async function testChannelAccess(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      headers: { "User-Agent": UA },
      timeout: 5000,
      maxRedirects: 1
    });
    return response.status >= 200 && response.status < 300;
  } catch {
    return false;
  }
}

async function probeChannelPatterns(company: string): Promise<string | undefined> {
  const patterns = [
    `https://www.youtube.com/@${company.toLowerCase().replace(/\s+/g, "")}`,
    `https://www.youtube.com/c/${company.replace(/\s+/g, "")}`,
    `https://www.youtube.com/${company.toLowerCase().replace(/\s+/g, "")}`,
    `https://www.youtube.com/@${company.toLowerCase().replace(/\s+/g, "-")}`
  ];

  for (const pattern of patterns) {
    if (await testChannelAccess(pattern)) {
      return pattern;
    }
  }

  return undefined;
}

export async function discoverCompanyChannel(company: string): Promise<CompanyDiscovery> {
  if (isYoutubeApiEnabled()) {
    try {
      const apiDiscovery = await discoverCompanyChannelViaApi(company);
      if (apiDiscovery) {
        return apiDiscovery;
      }
    } catch (e) {
      // If the YouTube API call fails (invalid key, quota, network), log and continue with fallback discovery
      // eslint-disable-next-line no-console
      console.error("discoverCompanyChannelViaApi failed, falling back to public discovery:", e instanceof Error ? e.message : e);
    }
  }

  const lowercase = company.toLowerCase();

  if (KNOWN_CHANNELS[lowercase]) {
    const url = KNOWN_CHANNELS[lowercase];
    const accessible = await testChannelAccess(url);

    if (accessible) {
      return {
        company,
        channelUrl: url,
        channelTitle: company,
        confidence: "high",
        confidenceReason: "Located via known official channel registry.",
        candidates: []
      };
    }
  }

  const probed = await probeChannelPatterns(company);
  if (probed) {
    return {
      company,
      channelUrl: probed,
      channelTitle: company,
      confidence: "high",
      confidenceReason: "Discovered via standard YouTube handle pattern matching.",
      candidates: []
    };
  }

  return {
    company,
    confidence: "low",
    confidenceReason: "Could not locate a verified official YouTube channel. Partial data may be available.",
    candidates: []
  };
}
