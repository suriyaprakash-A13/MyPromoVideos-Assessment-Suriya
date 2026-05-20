import { BestTimeToPostInsight, CompanyVideoData, VideoMetric } from "@/lib/types";
import { hasPublishHour, parseVideoDate } from "@/lib/dates";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ScoredVideo {
  video: VideoMetric;
  engagement: number;
  day: number;
  hour: number | null;
}

function videoEngagement(video: VideoMetric): number {
  const views = video.views ?? 0;
  if (views <= 0) {
    return 0;
  }
  return (((video.likes ?? 0) + (video.comments ?? 0)) / views) * 100;
}

function selectTopPerformers(companies: CompanyVideoData[]): ScoredVideo[] {
  const all = companies.flatMap((c) =>
    c.videos
      .map((video) => {
        const parsed = parseVideoDate(video.publishedAt);
        if (!parsed) {
          return undefined;
        }
        return {
          video,
          engagement: videoEngagement(video),
          day: parsed.day(),
          hour: hasPublishHour(video.publishedAt) ? parsed.hour() : null
        } satisfies ScoredVideo;
      })
      .filter(Boolean) as ScoredVideo[]
  );

  if (!all.length) {
    return [];
  }

  const sorted = [...all].sort((a, b) => b.engagement - a.engagement);
  const quartileCount = Math.max(4, Math.ceil(sorted.length * 0.25));

  if (sorted.length >= quartileCount) {
    return sorted.slice(0, quartileCount);
  }

  const perCompany: ScoredVideo[] = [];
  for (const company of companies) {
    const companyVideos = sorted.filter((s) =>
      company.videos.some((v) => v.url === s.video.url)
    );
    perCompany.push(...companyVideos.slice(0, 3));
  }

  const seen = new Set<string>();
  return perCompany.filter((s) => {
    if (seen.has(s.video.url)) {
      return false;
    }
    seen.add(s.video.url);
    return true;
  });
}

function averageEngagement(videos: ScoredVideo[]): number {
  if (!videos.length) {
    return 0;
  }
  return videos.reduce((sum, v) => sum + v.engagement, 0) / videos.length;
}

function findBestDayWindow(top: ScoredVideo[], baseline: number): { range: string; avg: number } {
  const byDay = new Map<number, ScoredVideo[]>();
  for (const item of top) {
    const list = byDay.get(item.day) ?? [];
    list.push(item);
    byDay.set(item.day, list);
  }

  let bestStart = 0;
  let bestLen = 1;
  let bestAvg = 0;

  for (let len = 1; len <= 5; len += 1) {
    for (let start = 0; start <= 6; start += 1) {
      const bucket: ScoredVideo[] = [];
      for (let d = 0; d < len; d += 1) {
        const day = (start + d) % 7;
        bucket.push(...(byDay.get(day) ?? []));
      }
      if (bucket.length < 2) {
        continue;
      }
      const avg = averageEngagement(bucket);
      if (avg > bestAvg) {
        bestAvg = avg;
        bestStart = start;
        bestLen = len;
      }
    }
  }

  const endDay = (bestStart + bestLen - 1) % 7;
  const range =
    bestLen === 1
      ? DAY_NAMES[bestStart]
      : `${DAY_NAMES[bestStart]}–${DAY_NAMES[endDay]}`;

  return { range, avg: bestAvg || baseline };
}

function formatHour(h: number): string {
  if (h === 0) {
    return "12am";
  }
  if (h < 12) {
    return `${h}am`;
  }
  if (h === 12) {
    return "12pm";
  }
  return `${h - 12}pm`;
}

function findBestHourWindow(top: ScoredVideo[]): { range: string; avg: number } | null {
  const withHour = top.filter((v) => v.hour !== null);
  if (withHour.length < 2) {
    return null;
  }

  let bestStart = 10;
  let bestEnd = 14;
  let bestAvg = 0;

  for (let start = 0; start < 24; start += 1) {
    for (let end = start + 1; end <= Math.min(start + 6, 24); end += 1) {
      const bucket = withHour.filter((v) => v.hour! >= start && v.hour! < end);
      if (bucket.length < 1) {
        continue;
      }
      const avg = averageEngagement(bucket);
      if (avg > bestAvg) {
        bestAvg = avg;
        bestStart = start;
        bestEnd = end;
      }
    }
  }

  if (bestAvg === 0) {
    return null;
  }

  return {
    range: `${formatHour(bestStart)}–${formatHour(bestEnd === 24 ? 0 : bestEnd)}`,
    avg: bestAvg
  };
}

export function analyzeBestTimeToPost(companies: CompanyVideoData[]): BestTimeToPostInsight | undefined {
  const top = selectTopPerformers(companies);
  const allScored = companies.flatMap((c) =>
    c.videos.map((video) => ({ video, engagement: videoEngagement(video) }))
  );
  const baseline = averageEngagement(
    allScored.map((s) => ({
      video: s.video,
      engagement: s.engagement,
      day: 0,
      hour: null
    }))
  );

  if (top.length < 4 || baseline <= 0) {
    return undefined;
  }

  const dayWindow = findBestDayWindow(top, baseline);
  const hourWindow = findBestHourWindow(top);
  const bestAvg = hourWindow?.avg ?? dayWindow.avg;
  const multiplier = Math.min(5, Math.max(1, Number((bestAvg / baseline).toFixed(1))));

  const hourDataRatio = top.filter((v) => v.hour !== null).length / top.length;
  let confidence: BestTimeToPostInsight["confidence"] = "high";
  if (top.length < 6 || hourDataRatio < 0.25) {
    confidence = "low";
  } else if (top.length < 10 || hourDataRatio < 0.5) {
    confidence = "medium";
  }

  const hourPart = hourWindow
    ? ` between ${hourWindow.range}`
    : "";
  const headline = hourWindow
    ? `Videos posted ${dayWindow.range}${hourPart} get ${multiplier}× more engagement than the channel average.`
    : `Videos posted on ${dayWindow.range} get ${multiplier}× more engagement than the channel average.`;

  const details: string[] = [
    `Based on ${top.length} top-performing videos across ${companies.length} channel(s) in this benchmark.`,
    `Baseline average engagement rate: ${baseline.toFixed(2)}%; best window: ${(bestAvg).toFixed(2)}%.`
  ];

  if (!hourWindow) {
    details.push(
      "Hour-level timing uses limited timestamp data — add YOUTUBE_API_KEY for publish-time precision."
    );
  } else if (confidence !== "high") {
    details.push("Expand the video sample or use API-backed timestamps to strengthen confidence.");
  }

  return {
    headline,
    bestDayRange: dayWindow.range,
    bestHourRange: hourWindow?.range ?? null,
    engagementMultiplier: multiplier,
    sampleSize: top.length,
    confidence,
    details
  };
}
