import {
  CompanyScore,
  CompanyVelocityEntry,
  CompanyVideoData,
  TrendDirection,
  TrendVelocityReport,
  VideoMetric
} from "@/lib/types";
import { parseVideoDate } from "@/lib/dates";

const TARGET_WINDOW = 30;
const MIN_WINDOW = 4;

export function trendArrow(direction: TrendDirection): string {
  if (direction === "up") {
    return "↑";
  }
  if (direction === "down") {
    return "↓";
  }
  return "→";
}

export function formatTrendChange(direction: TrendDirection, changePct: number): string {
  if (direction === "flat") {
    return `${trendArrow(direction)} flat`;
  }
  return `${trendArrow(direction)} ${Math.abs(changePct).toFixed(0)}%`;
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pctChange(recent: number, previous: number): number {
  if (previous <= 0 && recent <= 0) {
    return 0;
  }
  if (previous <= 0) {
    return 100;
  }
  return ((recent - previous) / previous) * 100;
}

function directionFromChange(changePct: number): TrendDirection {
  if (changePct > 5) {
    return "up";
  }
  if (changePct < -5) {
    return "down";
  }
  return "flat";
}

function sortNewestFirst(videos: VideoMetric[]): VideoMetric[] {
  return [...videos].sort((left, right) => {
    const leftDate = parseVideoDate(left.publishedAt);
    const rightDate = parseVideoDate(right.publishedAt);
    if (!leftDate && !rightDate) {
      return 0;
    }
    if (!leftDate) {
      return 1;
    }
    if (!rightDate) {
      return -1;
    }
    return rightDate.valueOf() - leftDate.valueOf();
  });
}

function splitVideoWindows(videos: VideoMetric[]): {
  recent: VideoMetric[];
  previous: VideoMetric[];
  windowSize: number;
} | null {
  const dated = sortNewestFirst(videos).filter((video) => parseVideoDate(video.publishedAt));
  if (dated.length < MIN_WINDOW * 2) {
    return null;
  }

  const windowSize = Math.min(TARGET_WINDOW, Math.floor(dated.length / 2));
  const recent = dated.slice(0, windowSize);
  const previous = dated.slice(windowSize, windowSize * 2);

  if (recent.length < MIN_WINDOW || previous.length < MIN_WINDOW) {
    return null;
  }

  return { recent, previous, windowSize };
}

function windowMetrics(videos: VideoMetric[]): {
  avgViews: number;
  engagementRate: number;
  uploadsPerWeek: number;
} {
  const views = videos.map((video) => video.views ?? 0).filter((value) => value > 0);
  const avgViews = average(views);
  const engagements = videos.map((video) => {
    const viewsValue = video.views ?? 0;
    if (viewsValue <= 0) {
      return 0;
    }
    return (((video.likes ?? 0) + (video.comments ?? 0)) / viewsValue) * 100;
  });
  const engagementRate = average(engagements);

  const dates = videos.map((video) => parseVideoDate(video.publishedAt)).filter(Boolean) as import("dayjs").Dayjs[];
  let uploadsPerWeek = videos.length / 4;
  if (dates.length >= 2) {
    const sorted = dates.sort((a, b) => a.valueOf() - b.valueOf());
    const spanDays = Math.max(7, sorted[sorted.length - 1].diff(sorted[0], "day"));
    uploadsPerWeek = (videos.length / spanDays) * 7;
  }

  return { avgViews, engagementRate, uploadsPerWeek };
}

function miniScore(metrics: ReturnType<typeof windowMetrics>): number {
  return Number(
    (
      metrics.avgViews * 0.35 +
      metrics.engagementRate * 100 * 0.35 +
      metrics.uploadsPerWeek * 500 * 0.3
    ).toFixed(2)
  );
}

export function analyzeTrendVelocity(companies: CompanyVideoData[]): TrendVelocityReport | undefined {
  const entries: CompanyVelocityEntry[] = [];

  for (const company of companies) {
    const windows = splitVideoWindows(company.videos);
    if (!windows) {
      continue;
    }

    const recentMetrics = windowMetrics(windows.recent);
    const previousMetrics = windowMetrics(windows.previous);
    const recentScore = miniScore(recentMetrics);
    const previousScore = miniScore(previousMetrics);
    const scoreChangePct = pctChange(recentScore, previousScore);

    const windowLabel =
      windows.windowSize >= TARGET_WINDOW
        ? "last 30 vs previous 30 videos"
        : `last ${windows.recent.length} vs previous ${windows.previous.length} videos`;

    entries.push({
      company: company.company,
      windowLabel,
      recentCount: windows.recent.length,
      previousCount: windows.previous.length,
      avgViews: {
        recent: recentMetrics.avgViews,
        previous: previousMetrics.avgViews,
        changePct: pctChange(recentMetrics.avgViews, previousMetrics.avgViews),
        direction: directionFromChange(pctChange(recentMetrics.avgViews, previousMetrics.avgViews))
      },
      engagementRate: {
        recent: recentMetrics.engagementRate,
        previous: previousMetrics.engagementRate,
        changePct: pctChange(recentMetrics.engagementRate, previousMetrics.engagementRate),
        direction: directionFromChange(pctChange(recentMetrics.engagementRate, previousMetrics.engagementRate))
      },
      uploadsPerWeek: {
        recent: recentMetrics.uploadsPerWeek,
        previous: previousMetrics.uploadsPerWeek,
        changePct: pctChange(recentMetrics.uploadsPerWeek, previousMetrics.uploadsPerWeek),
        direction: directionFromChange(pctChange(recentMetrics.uploadsPerWeek, previousMetrics.uploadsPerWeek))
      },
      scoreTrend: {
        recent: recentScore,
        previous: previousScore,
        changePct: scoreChangePct,
        direction: directionFromChange(scoreChangePct)
      }
    });
  }

  if (!entries.length) {
    return undefined;
  }

  const improving = entries.filter((entry) => entry.scoreTrend.direction === "up").length;
  const declining = entries.filter((entry) => entry.scoreTrend.direction === "down").length;

  return {
    windowDescription:
      entries[0].windowLabel.includes("30")
        ? "Compares the most recent 30 uploads against the prior 30 uploads per channel."
        : "Compares recent uploads against the prior batch (sample size limited by available public video data).",
    companies: entries,
    improvingCount: improving,
    decliningCount: declining,
    headline:
      improving >= declining
        ? `${improving} of ${entries.length} channel(s) show improving momentum in the latest upload window.`
        : `${declining} of ${entries.length} channel(s) show declining momentum in the latest upload window.`
  };
}

export function attachScoreTrends(scores: CompanyScore[], velocity?: TrendVelocityReport): CompanyScore[] {
  if (!velocity) {
    return scores;
  }

  const byCompany = new Map(velocity.companies.map((entry) => [entry.company, entry.scoreTrend]));

  return scores.map((score) => {
    const trend = byCompany.get(score.company);
    if (!trend) {
      return score;
    }

    return {
      ...score,
      trend: {
        direction: trend.direction,
        changePct: trend.changePct,
        recentScore: trend.recent,
        previousScore: trend.previous
      }
    };
  });
}
