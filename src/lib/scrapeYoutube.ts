import axios from "axios";
import * as cheerio from "cheerio";
import { CompanyVideoData, VideoMetric } from "@/lib/types";
import { fetchCompanyVideoDataViaApi, isYoutubeApiEnabled } from "@/lib/youtubeApi";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function parseCount(text?: string): number | undefined {
  if (!text) {
    return undefined;
  }

  const normalized = text.toLowerCase().replace(/,/g, "").trim();
  const match = normalized.match(/([0-9]*\.?[0-9]+)\s*([kmb])?/i);

  if (!match) {
    return undefined;
  }

  const value = Number(match[1]);
  const suffix = match[2]?.toLowerCase();

  if (suffix === "k") {
    return Math.round(value * 1_000);
  }

  if (suffix === "m") {
    return Math.round(value * 1_000_000);
  }

  if (suffix === "b") {
    return Math.round(value * 1_000_000_000);
  }

  return Math.round(value);
}

function extractYtInitialData(html: string): any | null {
  try {
    const match = html.match(/var\s+ytInitialData\s*=\s*({.+?});\s*<\/script>/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    const altMatch = html.match(/window\["ytInitialData"\]\s*=\s*({.+?});/);
    if (altMatch && altMatch[1]) {
      return JSON.parse(altMatch[1]);
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

function extractVideosFromYtInitialData(data: any): VideoMetric[] {
  const videos: VideoMetric[] = [];
  try {
    const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    for (const tab of tabs) {
      if (tab?.tabRenderer?.content?.richGridRenderer) {
        const contents = tab.tabRenderer.content.richGridRenderer.contents || [];
        for (const item of contents) {
          const content = item?.richItemRenderer?.content;
          if (!content) continue;

          let title = "Untitled";
          let videoId = "";
          let viewCountText = "";
          let publishedTimeText = "";

          if (content.videoRenderer) {
            const video = content.videoRenderer;
            videoId = video.videoId;
            title = video.title?.runs?.[0]?.text || "Untitled";
            viewCountText = video.viewCountText?.simpleText || video.viewCountText?.runs?.[0]?.text || "";
            publishedTimeText = video.publishedTimeText?.simpleText || "";
          } else if (content.lockupViewModel) {
            const video = content.lockupViewModel;
            videoId = video.contentId;
            const lockupMetadata = video.metadata?.lockupMetadataViewModel;
            title = lockupMetadata?.title?.content || "Untitled";
            const parts = lockupMetadata?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts || [];
            viewCountText = parts[0]?.text?.content || "";
            publishedTimeText = parts[1]?.text?.content || "";
          }

          if (videoId) {
            const views = parseCount(viewCountText) || 0;
            const likes = Math.max(1, Math.round(views * 0.02));
            const comments = Math.max(0, Math.round(views * 0.002));
            
            videos.push({
              title,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              views,
              likes,
              comments,
              publishedAt: publishedTimeText
            });
            
            if (videos.length >= 30) break;
          }
        }
      }
      if (videos.length > 0) break;
    }
  } catch (e) {
    // Silently continue on structure changes
  }
  return videos;
}

function pickStatsFromHtml(html: string): { subscribers?: number; totalVideos?: number; description?: string } {
  const $ = cheerio.load(html);
  const rawText = $("body").text();

  const subMatch = rawText.match(/([0-9][0-9.,]*\s*[KMB]?)\s+subscribers/i);
  const videoMatch = rawText.match(/([0-9][0-9.,]*\s*[KMB]?)\s+videos/i);
  const descriptionMeta = $("meta[name='description']").attr("content")?.trim();

  const altSubMatch = rawText.match(/var\s+subscriberCountText\s*=\s*["']([^"']+)["']/i);
  const altVideoMatch = rawText.match(/var\s+videoCountText\s*=\s*["']([^"']+)["']/i);

  return {
    subscribers: parseCount(subMatch?.[1] || altSubMatch?.[1]),
    totalVideos: parseCount(videoMatch?.[1] || altVideoMatch?.[1]),
    description: descriptionMeta
  };
}

export async function extractCompanyVideoData(discovery: CompanyVideoData["discovery"]): Promise<CompanyVideoData> {
  if (isYoutubeApiEnabled() && discovery.channelId) {
    try {
      const apiData = await fetchCompanyVideoDataViaApi(discovery);
      return {
        ...apiData,
        notes: apiData.notes.length ? apiData.notes : ["Fetched via YouTube Data API v3."]
      };
    } catch (e) {
      // If API fetching fails, log and continue to attempt public scraping fallback
      // eslint-disable-next-line no-console
      console.error("fetchCompanyVideoDataViaApi failed, falling back to HTML scraping:", e instanceof Error ? e.message : e);
    }
  }

  if (!discovery.channelUrl) {
    return {
      company: discovery.company,
      discovery,
      videos: [],
      dataQuality: "limited",
      notes: ["No reliable channel URL discovered."]
    };
  }

  const channelUrl = discovery.channelUrl.replace(/\/$/, "");
  const videosUrl = `${channelUrl}/videos`;

  try {
    const channelResponse = await axios.get<string>(channelUrl, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      timeout: 15000
    });

    const channelStats = pickStatsFromHtml(channelResponse.data);
    const notes: string[] = [];

    let videos: VideoMetric[] = [];

    try {
      const videosResponse = await axios.get<string>(videosUrl, {
        headers: { "User-Agent": UA, Accept: "text/html" },
        timeout: 15000
      });

      const ytData = extractYtInitialData(videosResponse.data);
      if (ytData) {
        videos = extractVideosFromYtInitialData(ytData);
      }

      if (videos.length === 0) {
        notes.push("Could not extract real video metrics from channel page.");
      } else {
        notes.push(`Successfully extracted ${videos.length} real video details from public channel page. Likes and comments are estimated based on views to avoid randomized mock data.`);
      }
    } catch {
      notes.push("Could not fetch videos page.");
    }

    return {
      company: discovery.company,
      discovery,
      subscribers: channelStats.subscribers,
      totalVideos: channelStats.totalVideos,
      channelDescription: channelStats.description,
      videos,
      dataQuality: videos.length > 6 ? "full" : videos.length > 0 ? "partial" : "limited",
      notes
    };
  } catch (error) {
    return {
      company: discovery.company,
      discovery,
      videos: [],
      dataQuality: "limited",
      notes: [
        "Channel data retrieval failed.",
        error instanceof Error ? error.message : "Unknown scraping error"
      ]
    };
  }
}
