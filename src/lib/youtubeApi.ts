import axios from "axios";
import dayjs from "dayjs";
import { CompanyDiscovery, CompanyVideoData, SearchCandidate, VideoMetric } from "@/lib/types";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY;

interface SearchItem {
  id?: { channelId?: string };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
}

interface ChannelItem {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
  statistics?: {
    subscriberCount?: string;
    viewCount?: string;
    videoCount?: string;
  };
  contentDetails?: {
    relatedPlaylists?: {
      uploads?: string;
    };
  };
}

interface PlaylistItem {
  contentDetails?: {
    videoId?: string;
    videoPublishedAt?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
}

interface VideoItem {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    tags?: string[];
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
  contentDetails?: {
    duration?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

function hasApiKey(): boolean {
  return Boolean(API_KEY);
}

function toNumber(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({
    part: "snippet",
    type: "channel",
    maxResults: "5",
    q: query,
    key: API_KEY ?? ""
  });

  return `${API_BASE}/search?${params.toString()}`;
}

function buildChannelsUrl(ids: string[], parts = ["snippet", "statistics", "contentDetails"]): string {
  const params = new URLSearchParams({
    part: parts.join(","),
    id: ids.join(","),
    maxResults: "50",
    key: API_KEY ?? ""
  });

  return `${API_BASE}/channels?${params.toString()}`;
}

function buildPlaylistItemsUrl(playlistId: string, maxResults = 50, pageToken?: string): string {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId,
    maxResults: String(maxResults),
    key: API_KEY ?? ""
  });

  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  return `${API_BASE}/playlistItems?${params.toString()}`;
}

async function fetchUploadVideoIds(playlistId: string, limit = 60): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  while (ids.length < limit) {
    const payload = await apiGet<{ items?: PlaylistItem[]; nextPageToken?: string }>(
      buildPlaylistItemsUrl(playlistId, Math.min(50, limit - ids.length), pageToken)
    );

    const batch = (payload.items ?? [])
      .map((item) => item.contentDetails?.videoId)
      .filter((videoId): videoId is string => Boolean(videoId));

    ids.push(...batch);
    pageToken = payload.nextPageToken;

    if (!pageToken || batch.length === 0) {
      break;
    }
  }

  return ids.slice(0, limit);
}

function buildVideosUrl(ids: string[]): string {
  const params = new URLSearchParams({
    part: "snippet,contentDetails,statistics",
    id: ids.join(","),
    maxResults: "50",
    key: API_KEY ?? ""
  });

  return `${API_BASE}/videos?${params.toString()}`;
}

function scoreChannel(company: string, title?: string, description?: string, thumbnailUrl?: string): number {
  const normalizedCompany = company.toLowerCase().replace(/\s+/g, "");
  const normalizedTitle = (title ?? "").toLowerCase();
  const normalizedDescription = (description ?? "").toLowerCase();
  let score = 0;

  if (normalizedTitle.includes(company.toLowerCase())) {
    score += 35;
  }

  if (normalizedTitle.includes(normalizedCompany)) {
    score += 15;
  }

  if (normalizedDescription.includes("official")) {
    score += 10;
  }

  if (normalizedDescription.includes(company.toLowerCase())) {
    score += 10;
  }

  if (thumbnailUrl) {
    score += 5;
  }

  if (normalizedTitle.includes("youtube")) {
    score += 5;
  }

  return score;
}

async function apiGet<T>(url: string): Promise<T> {
  const response = await axios.get<T>(url, { timeout: 15000 });
  return response.data;
}

function chooseThumbnail(item?: { default?: { url?: string }; medium?: { url?: string }; high?: { url?: string } }): string | undefined {
  return item?.high?.url ?? item?.medium?.url ?? item?.default?.url;
}

export function isYoutubeApiEnabled(): boolean {
  return hasApiKey();
}

/** Resolve UC… id from /channel/… or @handle URLs when API search did not return an id. */
export async function resolveChannelIdFromUrl(channelUrl?: string): Promise<string | undefined> {
  if (!channelUrl) {
    return undefined;
  }

  const directMatch = channelUrl.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/i);
  if (directMatch?.[1]) {
    return directMatch[1];
  }

  if (!hasApiKey()) {
    return undefined;
  }

  const handleMatch = channelUrl.match(/youtube\.com\/@([^/?#]+)/i);
  if (!handleMatch?.[1]) {
    return undefined;
  }

  const params = new URLSearchParams({
    part: "id",
    forHandle: decodeURIComponent(handleMatch[1]),
    key: API_KEY ?? ""
  });

  try {
    const payload = await apiGet<{ items?: ChannelItem[] }>(`${API_BASE}/channels?${params.toString()}`);
    return payload.items?.[0]?.id;
  } catch {
    return undefined;
  }
}

export async function enrichDiscovery(discovery: CompanyDiscovery): Promise<CompanyDiscovery> {
  if (discovery.channelId) {
    return {
      ...discovery,
      channelUrl: discovery.channelUrl ?? `https://www.youtube.com/channel/${discovery.channelId}`
    };
  }

  const channelId = await resolveChannelIdFromUrl(discovery.channelUrl);
  if (!channelId) {
    return discovery;
  }

  return {
    ...discovery,
    channelId,
    channelUrl: `https://www.youtube.com/channel/${channelId}`
  };
}

export async function fetchChannelMetadataViaApi(
  channelId: string
): Promise<Pick<
  CompanyVideoData,
  "channelCreatedAt" | "channelDescription" | "subscribers" | "totalVideos" | "channelViews" | "channelThumbnailUrl"
> | null> {
  if (!hasApiKey()) {
    return null;
  }

  try {
    const payload = await apiGet<{ items?: ChannelItem[] }>(buildChannelsUrl([channelId], ["snippet", "statistics"]));
    const channel = payload.items?.[0];
    if (!channel) {
      return null;
    }

    return {
      channelCreatedAt: channel.snippet?.publishedAt,
      channelDescription: channel.snippet?.description,
      channelThumbnailUrl: chooseThumbnail(channel.snippet?.thumbnails),
      subscribers: toNumber(channel.statistics?.subscriberCount),
      totalVideos: toNumber(channel.statistics?.videoCount),
      channelViews: toNumber(channel.statistics?.viewCount)
    };
  } catch {
    return null;
  }
}

export async function discoverCompanyChannelViaApi(company: string): Promise<CompanyDiscovery | null> {
  if (!hasApiKey()) {
    return null;
  }

  const queries = [
    `${company} official youtube channel`,
    `${company} youtube`,
    `${company} brand channel`
  ];

  const candidateMap = new Map<string, SearchCandidate & { channelId: string }>();

  for (const query of queries) {
    const payload = await apiGet<{ items?: SearchItem[] }>(buildSearchUrl(query));
    for (const item of payload.items ?? []) {
      const channelId = item.id?.channelId;
      const title = item.snippet?.title?.trim();
      const snippet = item.snippet?.description?.trim() ?? "";
      const thumbnailUrl = chooseThumbnail(item.snippet?.thumbnails) ?? "";

      if (!channelId || !title) {
        continue;
      }

      const existing = candidateMap.get(channelId);
      if (!existing || title.length > existing.title.length) {
        candidateMap.set(channelId, { channelId, title, url: `https://www.youtube.com/channel/${channelId}`, snippet: snippet || thumbnailUrl });
      }
    }
  }

  const channelIds = [...candidateMap.keys()];
  if (channelIds.length === 0) {
    return null;
  }

  const detailsPayload = await apiGet<{ items?: ChannelItem[] }>(buildChannelsUrl(channelIds));
  const detailsById = new Map((detailsPayload.items ?? []).map((item) => [item.id ?? "", item]));

  const ranked = [...candidateMap.values()]
    .map((candidate) => {
      const details = detailsById.get(candidate.channelId);
      const title = details?.snippet?.title ?? candidate.title;
      const description = details?.snippet?.description ?? candidate.snippet;
      const thumbnailUrl = chooseThumbnail(details?.snippet?.thumbnails);
      const score = scoreChannel(company, title, description, thumbnailUrl);

      return {
        candidate,
        details,
        score,
        title,
        description,
        thumbnailUrl
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best) {
    return null;
  }

  return {
    company,
    channelId: best.candidate.channelId,
    channelUrl: `https://www.youtube.com/channel/${best.candidate.channelId}`,
    channelTitle: best.title,
    channelThumbnailUrl: best.thumbnailUrl,
    confidence: best.score >= 45 ? "high" : best.score >= 25 ? "medium" : "low",
    confidenceReason: best.score >= 45
      ? "Matched via YouTube Data API channel search and metadata scoring."
      : "Matched via YouTube Data API channel search with partial metadata confidence.",
    candidates: [...candidateMap.values()].slice(0, 5)
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export async function fetchCompanyVideoDataViaApi(discovery: CompanyDiscovery): Promise<CompanyVideoData> {
  if (!hasApiKey() || !discovery.channelId) {
    return {
      company: discovery.company,
      discovery,
      videos: [],
      dataQuality: "limited",
      notes: ["YouTube API key not available or channel ID missing."]
    };
  }

  const channelPayload = await apiGet<{ items?: ChannelItem[] }>(buildChannelsUrl([discovery.channelId]));
  const channel = channelPayload.items?.[0];

  if (!channel) {
    return {
      company: discovery.company,
      discovery,
      videos: [],
      dataQuality: "limited",
      notes: ["Channel details could not be resolved from YouTube Data API."]
    };
  }

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  let videos: VideoMetric[] = [];
  const notes: string[] = [];

  if (uploadsPlaylistId) {
    const videoIds = await fetchUploadVideoIds(uploadsPlaylistId, 60);

    for (const batch of chunk(videoIds, 50)) {
      const videosPayload = await apiGet<{ items?: VideoItem[] }>(buildVideosUrl(batch));
      videos.push(
        ...(videosPayload.items ?? []).map((item) => {
          const snippet = item.snippet;
          const stats = item.statistics;
          return {
            title: snippet?.title ?? "Untitled video",
            description: snippet?.description,
            url: item.id ? `https://www.youtube.com/watch?v=${item.id}` : "",
            publishedAt: snippet?.publishedAt,
            views: toNumber(stats?.viewCount),
            likes: toNumber(stats?.likeCount),
            comments: toNumber(stats?.commentCount),
            duration: item.contentDetails?.duration,
            tags: snippet?.tags
          };
        })
      );
    }

    notes.push(`Fetched ${videos.length} recent videos from the channel uploads playlist.`);
  } else {
    notes.push("Uploads playlist not available from channel metadata.");
  }

  return {
    company: discovery.company,
    discovery,
    channelDescription: channel.snippet?.description,
    channelViews: toNumber(channel.statistics?.viewCount),
    channelCreatedAt: channel.snippet?.publishedAt,
    channelThumbnailUrl: chooseThumbnail(channel.snippet?.thumbnails),
    subscribers: toNumber(channel.statistics?.subscriberCount),
    totalVideos: toNumber(channel.statistics?.videoCount),
    videos,
    dataQuality: videos.length >= 10 ? "full" : videos.length > 0 ? "partial" : "limited",
    notes
  };
}

export function formatApiAge(date: string): string {
  const published = dayjs(date);
  if (!published.isValid()) {
    return date;
  }

  const days = dayjs().diff(published, "day");
  if (days <= 0) {
    return "today";
  }
  if (days === 1) {
    return "1 day ago";
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  if (days < 30) {
    return `${Math.round(days / 7)} weeks ago`;
  }
  return `${Math.round(days / 30)} months ago`;
}
